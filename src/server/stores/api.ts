import { InstanceOf, ModelBase } from "../../detool-api/model";

export interface ModelStore<M extends ModelBase> {
  create(instance: InstanceOf<M>): Promise<InstanceOf<M> | null>;
  list(): Promise<InstanceOf<M>[]>;
  getById(id: string): Promise<InstanceOf<M> | null>;
  update(id: string, newInstance: InstanceOf<M>): Promise<InstanceOf<M> | null>;
  delete(id: string): Promise<boolean>;
}
