import { InstanceOf, ModelBase } from "../../detool-api/model";

export interface CountOptions<M> {
  where?:
    | Array<
        [
          keyof M & string,
          "eq" | "ne" | "gt" | "lt" | "gte" | "lte" | "like",
          M[keyof M]
        ]
      >
    | undefined;
}
export interface ListOptions<M> {
  limit?: number | undefined;
  offset?: number | undefined;
  orderBy?: Array<[keyof M & string, "asc" | "desc"]> | undefined;
  where?:
    | Array<
        [
          keyof M & string,
          "eq" | "ne" | "gt" | "lt" | "gte" | "lte" | "like",
          M[keyof M]
        ]
      >
    | undefined;
}

export interface ModelStore<M extends ModelBase> {
  create(instance: InstanceOf<M>): Promise<InstanceOf<M> | null>;
  count(opts?: CountOptions<M>): Promise<number>;
  list(opts?: ListOptions<M>): Promise<InstanceOf<M>[]>;
  getById(id: string): Promise<InstanceOf<M> | null>;
  update(id: string, newInstance: InstanceOf<M>): Promise<InstanceOf<M> | null>;
  delete(id: string): Promise<boolean>;
}
