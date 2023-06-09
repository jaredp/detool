import { PostgresModelStore } from "../server/stores/PostgresModelStore";
import { ModelStore } from "../server/stores/api";
import { ModelBase, InstanceOf } from "./model";

export const getApiForModel = <M extends ModelBase>(
  model: M
): ModelStore<M> => {
  if (typeof window === "undefined") {
    console.log("getApiForModel", model.name);

    const store = new PostgresModelStore(model, 10);
    const initPromise = store.init();
    return {
      count: async (opts) => {
        await initPromise;
        console.log("count", model.name, opts);
        return store.count(opts);
      },
      list: async (opts) => {
        await initPromise;
        console.log("list", model.name, opts);
        return store.list(opts);
      },
      create: async (data: InstanceOf<M>) => {
        await initPromise;

        return store.create(data);
      },
      getById: async (id: string) => {
        await initPromise;
        return store.getById(id);
      },
      update: async (id: string, data: InstanceOf<M>) => {
        await initPromise;
        return store.update(id, data);
      },
      delete: async (id: string) => {
        await initPromise;
        return store.delete(id);
      },
    };
  } else {
    return {} as any;
  }
};
