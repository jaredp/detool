// singleton class that stores all models

import { ModelBase, InstanceOf } from "../../detool-api/model";
import { dummy_instance } from "../../detool-api/ui";
import { ModelStore } from "./api";

/** Model store used for testing purposes. Does not persist data. */
export class InMemoryModelStore<M extends ModelBase> implements ModelStore<M> {
  private model: M;
  private seedCount: number;

  constructor(model: M, seedCount: number) {
    this.model = model;
    this.seedCount = seedCount;
    if (seedCount < 0) {
      throw new Error("seedCount must be >= 0");
    }
    for (let i = 0; i < seedCount; i++) {
      this.create(dummy_instance(model));
    }
    console.log("InMemoryModelStore created");
  }

  /** Use JS Array as a store for now */
  private instances: InstanceOf<M>[] = [];
  async create(data: InstanceOf<M>): Promise<InstanceOf<M> | null> {
    if (this.instances.find((instance) => instance.id === data.id)) {
      return null;
    }
    // TODO: Support validation and default
    this.instances.push(data);
    return data;
  }
  async list(): Promise<InstanceOf<M>[]> {
    return this.instances;
  }
  async getById(id: string): Promise<InstanceOf<M> | null> {
    return this.instances.find((instance) => instance.id === id) || null;
  }
  async update(
    id: string,
    newInstance: InstanceOf<M>
  ): Promise<InstanceOf<M> | null> {
    const index = this.instances.findIndex((instance) => instance.id === id);
    if (index === -1) {
      return null;
    }
    this.instances[index] = newInstance;
    return newInstance;
  }
  async delete(id: string): Promise<boolean> {
    const index = this.instances.findIndex((instance) => instance.id === id);
    if (index === -1) {
      return false;
    }
    this.instances.splice(index, 1);
    return true;
  }
}
