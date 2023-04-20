import { InstanceOf, ModelBase } from "../../api";

export interface ModelStore<M extends ModelBase> {
  create(instance: InstanceOf<M>): InstanceOf<M> | null;
  list(): InstanceOf<M>[];
  getById(id: string): InstanceOf<M> | null;
  update(id: string, newInstance: InstanceOf<M>): InstanceOf<M> | null;
  delete(id: string): boolean;
}
