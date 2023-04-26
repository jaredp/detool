// import { InMemoryModelStore } from "../server/stores/InMemoryModelStore";
import { SqliteModelStore } from "../server/stores/SqliteModelStore";
import { ModelBase, ModelAPI, InstanceOf } from "./model";

export const getApiForModel = <M extends ModelBase>(
  name: string,
  model: M
): ModelAPI<M> => {
  if (typeof window === "undefined") {
    console.log("getApiForModel", name);

    const store = new SqliteModelStore(model, 10);
    const modelApi = {
      list: async () => {
        console.log("list", name);
        return store.list();
      },
      create: async (data: InstanceOf<M>) => {
        return store.create(data);
      },
      getById: async (id: string) => {
        return store.getById(id);
      },
      update: async (id: string, data: InstanceOf<M>) => {
        return store.update(id, data);
      },
      delete: async (id: string) => {
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
