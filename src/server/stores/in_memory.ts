// singleton class that stores all models

import { InstanceOf, ModelBase } from "../../detool-api/api";
import { ModelStore } from "./api";

/** Model store used for testing purposes. Does not persist data. */
export class InMemoryModelStore<M extends ModelBase> implements ModelStore<M> {
  /** Use JS Array as a store for now */
  private instances: InstanceOf<M>[] = [];
  create(data: InstanceOf<M>): InstanceOf<M> | null {
    if (this.instances.find((instance) => instance.id === data.id)) {
      return null;
    }
    // TODO: Support validation and default
    this.instances.push(data);
    return data;
  }
  list(): InstanceOf<M>[] {
    return this.instances;
  }
  getById(id: string): InstanceOf<M> | null {
    return this.instances.find((instance) => instance.id === id) || null;
  }
  update(id: string, newInstance: InstanceOf<M>): InstanceOf<M> | null {
    const index = this.instances.findIndex((instance) => instance.id === id);
    if (index === -1) {
      return null;
    }
    this.instances[index] = newInstance;
    return newInstance;
  }
  delete(id: string): boolean {
    const index = this.instances.findIndex((instance) => instance.id === id);
    if (index === -1) {
      return false;
    }
    this.instances.splice(index, 1);
    return true;
  }
}
