// singleton class that stores all models

import { ModelBase, InstanceOf } from "../../detool-api/model";
import { dummy_instance, model_sql_types } from "../../detool-api/ui";
import { ModelStore } from "./api";
import { createKysely } from "@vercel/postgres-kysely";

const db = createKysely<any>();

export class PostgresModelStore<M extends ModelBase> implements ModelStore<M> {
  constructor(private model: M, private seedCount: number) {}

  async init() {
    const schema_types = model_sql_types(this.model);

    // create schema
    let schemaBuilder = db.schema.createTable(this.model.tablename).ifNotExists();
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
  async list(): Promise<InstanceOf<M>[]> {
    const result = (await db
      .selectFrom(this.model.tablename)
      .selectAll()
      .orderBy("ctid")
      .execute()) as InstanceOf<M>[];
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
