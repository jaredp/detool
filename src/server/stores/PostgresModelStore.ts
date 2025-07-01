// singleton class that stores all models

import { ModelBase, InstanceOf, DatabaseInstanceOf, isComputedField } from "../../detool-api/model";
import { dummy_instance, model_sql_types, enrichWithComputedFields, extractDatabaseFields } from "../../detool-api/ui";
import { CountOptions, FilterDescriptor, ListOptions, ModelStore } from "./api";
import { createKysely } from "@vercel/postgres-kysely";

const db = createKysely<any>();

function opToKyselyOp(
  op: "eq" | "ne" | "gt" | "lt" | "gte" | "lte" | "like"
): "=" | "<>" | ">" | ">=" | "<" | "<=" | "like" {
  switch (op) {
    case "eq":
      return "=";
    case "ne":
      return "<>";
    case "gt":
      return ">";
    case "lt":
      return "<";
    case "gte":
      return ">=";
    case "lte":
      return "<=";
    case "like":
      return "like";
  }
}

export class PostgresModelStore<M extends ModelBase> implements ModelStore<M> {
  constructor(private model: M, private seedCount: number) {}

  async init() {
    const schema_types = model_sql_types(this.model);

    // create schema - only for non-computed fields
    let schemaBuilder = db.schema
      .createTable(this.model.tablename)
      .ifNotExists();
    
    for (const [key, value] of Object.entries(schema_types)) {
      // Skip computed fields (they will be null in the schema_types)
      if (value !== null) {
        schemaBuilder = schemaBuilder.addColumn(key, value);
      }
    }
    await schemaBuilder.execute();

    // FIXME: should add seed data only if table doesn't exist
    // as is, if a table is ever empty, we'll auto-add seed data

    const currentRowCount = await db
      .selectFrom(this.model.tablename)
      .select([db.fn.count("id").as("count")])
      .executeTakeFirstOrThrow();
    const hasData = Number(currentRowCount.count) > 0;
    if (!hasData) {
      if (this.seedCount < 0) {
        throw new Error("seedCount must be >= 0");
      }
      for (let i = 0; i < this.seedCount; i++) {
        const fullInstance = await dummy_instance(this.model);
        // Only store the database fields
        const dbInstance = extractDatabaseFields(this.model, fullInstance);
        await this.createDatabaseRecord(dbInstance);
      }

      console.log("PostgresModelStore seeded");
    }
  }

  private async createDatabaseRecord(data: DatabaseInstanceOf<M>): Promise<DatabaseInstanceOf<M> | null> {
    const result = await db
      .insertInto(this.model.tablename)
      .values(data)
      .execute();

    return result.length > 0 ? data : null;
  }

  async create(data: InstanceOf<M>): Promise<InstanceOf<M> | null> {
    // Extract only database fields for storage
    const dbData = extractDatabaseFields(this.model, data);
    const dbResult = await this.createDatabaseRecord(dbData);
    
    if (!dbResult) {
      return null;
    }
    
    // Return the full instance with computed fields
    return enrichWithComputedFields(this.model, dbResult);
  }

  filtered_collection(filter: FilterDescriptor<M>) {
    let query = db.selectFrom(this.model.tablename);
    for (const [lval, op, rval] of filter) {
      // Only allow filtering on non-computed fields
      const field = this.model.fields[lval as keyof typeof this.model.fields];
      if (!isComputedField(field)) {
        query = query.where(lval, opToKyselyOp(op), rval as any);
      }
    }
    return query;
  }

  async count(opts?: CountOptions<M>): Promise<number> {
    let result = await this.filtered_collection(opts?.where ?? [])
      .select(db.fn.countAll().as("c"))
      .executeTakeFirst();
    return Number(result?.c) ?? 0;
  }

  async list(opts?: ListOptions<M>): Promise<InstanceOf<M>[]> {
    let query = this.filtered_collection(opts?.where ?? []).selectAll();
    if (opts?.limit) {
      query = query.limit(opts.limit);
    }
    if (opts?.offset) {
      query = query.offset(opts.offset);
    }
    if (opts?.orderBy) {
      for (const [lval, dir] of opts.orderBy) {
        // Only allow ordering by non-computed fields
        const field = this.model.fields[lval as keyof typeof this.model.fields];
        if (!isComputedField(field)) {
          query = query.orderBy(lval, dir);
        }
      }
    } else {
      query = query.orderBy("ctid");
    }
    
    const dbResults = await query.execute() as DatabaseInstanceOf<M>[];
    
    // Enrich each result with computed fields
    return dbResults.map(dbResult => enrichWithComputedFields(this.model, dbResult));
  }

  async getById(id: string): Promise<InstanceOf<M> | null> {
    const dbResult = await db
      .selectFrom(this.model.tablename)
      .where("id", "=", id)
      .executeTakeFirst() as DatabaseInstanceOf<M> | undefined;
    
    if (!dbResult) {
      return null;
    }
    
    return enrichWithComputedFields(this.model, dbResult);
  }
  
  async update(
    id: string,
    newInstance: InstanceOf<M>
  ): Promise<InstanceOf<M> | null> {
    // Extract only database fields for update
    const dbData = extractDatabaseFields(this.model, newInstance);
    
    const result = await db
      .updateTable(this.model.tablename)
      .where("id", "=", id)
      .set(dbData)
      .executeTakeFirst();
    
    if (result.numUpdatedRows === 0) {
      return null;
    }
    
    // Return the full instance with computed fields
    return enrichWithComputedFields(this.model, { ...dbData, id } as DatabaseInstanceOf<M>);
  }

  async delete(id: string): Promise<boolean> {
    const result = await db
      .deleteFrom(this.model.tablename)
      .where("id", "=", id)
      .execute();
    return result.length > 0;
  }
}
