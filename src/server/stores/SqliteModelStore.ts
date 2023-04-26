// singleton class that stores all models

import { ModelBase, InstanceOf } from "../../detool-api/model";
import { dummy_instance } from "../../detool-api/ui";
import { ModelStore } from "./api";
import BetterSqliteDatabase from "better-sqlite3";
import { Kysely, SqliteDialect } from "kysely";

/** Model store used for testing purposes. Does not persist data. */
export class SqliteModelStore<M extends ModelBase> implements ModelStore<M> {
  private db: Kysely<{
    person: InstanceOf<M>;
  }>;

  constructor(model: M, seedCount: number) {
    this.db = new Kysely<{
      person: InstanceOf<M>;
    }>({
      dialect: new SqliteDialect({
        database: new BetterSqliteDatabase(":memory:"),
      }),
    });
    if (seedCount < 0) {
      throw new Error("seedCount must be >= 0");
    }
    for (let i = 0; i < seedCount; i++) {
      this.create(dummy_instance(model));
    }
    console.log("SqliteModelStore created");
  }

  async create(data: InstanceOf<M>): Promise<InstanceOf<M> | null> {
    const result = await this.db
      .insertInto("person")
      .values(data as any)
      .execute();

    return result.length > 0 ? data : null;
  }
  async list(): Promise<InstanceOf<M>[]> {
    return (await this.db.selectFrom("person").execute()) as InstanceOf<M>[];
  }
  async getById(id: string): Promise<InstanceOf<M> | null> {
    const result = await this.db
      .selectFrom("person")
      .where("id", "=", id as any)
      .executeTakeFirst();
    return (result as any) ?? null;
  }
  async update(
    id: string,
    newInstance: InstanceOf<M>
  ): Promise<InstanceOf<M> | null> {
    const result = await this.db
      .updateTable("person")
      .where("id", "=", id as any)
      .set(newInstance as any)
      .executeTakeFirst();
    return result.numUpdatedRows > 0 ? newInstance : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db
      .deleteFrom("person")
      .where("id", "=", id as any)
      .execute();
    return result.length > 0;
  }
}
