// import { InMemoryModelStore } from "../server/stores/InMemoryModelStore";
import { PostgresModelStore } from "../server/stores/PostgresModelStore";
import { ModelBase, ModelAPI, InstanceOf } from "./model";

export const getApiForModel = <M extends ModelBase>(
  name: string,
  model: M
): ModelAPI<M> => {
  if (typeof window === "undefined") {
    console.log("getApiForModel", name);

    const store = new PostgresModelStore(model, 10);
    const initPromise = store.init();
    const modelApi = {
      list: async () => {
        await initPromise;
        console.log("list", name);
        return store.list();
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

    return {
      __serverApi: modelApi,
    };
  } else {
    return {} as any;
  }
};
