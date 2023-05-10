// singleton class that stores all models

import { ModelBase, InstanceOf } from "../../detool-api/model";
import { dummy_instance, model_sql_types } from "../../detool-api/ui";
import { CountOptions, ListOptions, ModelStore } from "./api";
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

    // create schema
    let schemaBuilder = db.schema
      .createTable(this.model.tablename)
      .ifNotExists();
    for (const [key, value] of Object.entries(schema_types)) {
      schemaBuilder = schemaBuilder.addColumn(key, value);
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
        this.create(await dummy_instance(this.model));
      }

      console.log("PostgresModelStore seeded");
    }
  }

  async create(data: InstanceOf<M>): Promise<InstanceOf<M> | null> {
    const result = await db
      .insertInto(this.model.tablename)
      .values(data)
      .execute();

    return result.length > 0 ? data : null;
  }

  async count(opts?: CountOptions<M>): Promise<number> {
    let query = db
      .selectFrom(this.model.tablename)
      .select(db.fn.countAll().as("c"));
    if (opts?.where) {
      for (const [lval, op, rval] of opts.where) {
        query = query.where(lval, opToKyselyOp(op), rval as any);
      }
    }
    const result = await query.executeTakeFirst();
    return Number(result?.c) ?? 0;
  }

  async list(opts?: ListOptions<M>): Promise<InstanceOf<M>[]> {
    let query = db.selectFrom(this.model.tablename).selectAll();
    if (opts?.limit) {
      query = query.limit(opts.limit);
    }
    if (opts?.offset) {
      query = query.offset(opts.offset);
    }
    if (opts?.where) {
      for (const [lval, op, rval] of opts.where) {
        query = query.where(lval, opToKyselyOp(op), rval as any);
      }
    }
    if (opts?.orderBy) {
      for (const [lval, dir] of opts.orderBy) {
        query = query.orderBy(lval, dir);
      }
    } else {
      query = query.orderBy("ctid");
    }
    const result = (await query.execute()) as InstanceOf<M>[];
    return result;
  }

  async getById(id: string): Promise<InstanceOf<M> | null> {
    const result = await db
      .selectFrom(this.model.tablename)
      .where("id", "=", id)
      .executeTakeFirst();
    return (result as any) ?? null;
  }
  async update(
    id: string,
    newInstance: InstanceOf<M>
  ): Promise<InstanceOf<M> | null> {
    const result = await db
      .updateTable(this.model.tablename)
      .where("id", "=", id)
      .set(newInstance)
      .executeTakeFirst();
    return result.numUpdatedRows > 0 ? newInstance : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await db
      .deleteFrom(this.model.tablename)
      .where("id", "=", id)
      .execute();
    return result.length > 0;
  }
}
