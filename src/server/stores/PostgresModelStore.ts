// singleton class that stores all models

import { ModelBase, InstanceOf } from "../../detool-api/model";
import { dummy_instance } from "../../detool-api/ui";
import { ModelStore } from "./api";
import { Kysely } from "kysely";
import { createKysely } from "@vercel/postgres-kysely";

const tableName = "person";
/** Model store used for testing purposes. Does not persist data. */
export class PostgresModelStore<M extends ModelBase> implements ModelStore<M> {
  private db: Kysely<{
    person: InstanceOf<M>;
  }>;

  constructor(private model: M, private seedCount: number) {
    this.db = createKysely<{
      person: InstanceOf<M>;
    }>();

    console.log("PostgresModelStore created");
  }

  async init() {
    // create schema
    let schemaBuilder = this.db.schema.createTable(tableName).ifNotExists();
    for (const [key, value] of Object.entries(this.model)) {
      const exampleValue = value.initial_value();

      let dbType: "varchar" | "integer" | "boolean" | "timestamp" = "varchar";
      if (exampleValue instanceof Date) {
        dbType = "timestamp";
      }

      schemaBuilder = schemaBuilder.addColumn(key, dbType).ifNotExists();
    }
    await schemaBuilder.execute();
    const currentRowCount = await this.db
      .selectFrom(tableName)
      .select([this.db.fn.count("id").as("count")])
      .executeTakeFirstOrThrow();
    const hasData = Number(currentRowCount.count) > 0;
    if (!hasData) {
      if (this.seedCount < 0) {
        throw new Error("seedCount must be >= 0");
      }
      for (let i = 0; i < this.seedCount; i++) {
        this.create(dummy_instance(this.model));
      }

      console.log("PostgresModelStore seeded");
    }
  }

  async create(data: InstanceOf<M>): Promise<InstanceOf<M> | null> {
    const result = await this.db
      .insertInto(tableName)
      .values(data as any)
      .execute();

    return result.length > 0 ? data : null;
  }
  async list(): Promise<InstanceOf<M>[]> {
    const result = (await this.db
      .selectFrom(tableName)
      .selectAll()
      .execute()) as InstanceOf<M>[];
    return result;
  }
  async getById(id: string): Promise<InstanceOf<M> | null> {
    const result = await this.db
      .selectFrom(tableName)
      .where("id", "=", id as any)
      .executeTakeFirst();
    return (result as any) ?? null;
  }
  async update(
    id: string,
    newInstance: InstanceOf<M>
  ): Promise<InstanceOf<M> | null> {
    const result = await this.db
      .updateTable(tableName)
      .where("id", "=", id as any)
      .set(newInstance as any)
      .executeTakeFirst();
    return result.numUpdatedRows > 0 ? newInstance : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db
      .deleteFrom(tableName)
      .where("id", "=", id as any)
      .execute();
    return result.length > 0;
  }
}
