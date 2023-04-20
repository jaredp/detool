import { ModelStore } from "./stores/api";
import { CrudUI, ModelBase, dummy_instance } from "../api";
import { Person, PersonForm } from "../models/Person";
import { InMemoryModelStore } from "./stores/in_memory";

export class InMemoryServer {
  private static _instance: InMemoryServer;
  public static get instance(): InMemoryServer {
    if (typeof window !== "undefined") {
      throw new Error("Server instance is not available on client");
    }
    if (!this._instance) {
      const server = new InMemoryServer();
      server.start();
      this._instance = server;
    }
    return this._instance;
  }
  private _stores: { [key: string]: ModelStore<any> } = {};

  private start(): void {
    this.registerModel("Person", Person, PersonForm);
    console.log("InMemoryServer started");
  }
  private registerModel<M extends ModelBase>(
    name: string,
    model: M,
    _form: React.FC<{ instance: CrudUI<M> }>
  ) {
    if (name in this._stores) {
      throw new Error(`Model ${name} already registered`);
    }
    const modelStore = new InMemoryModelStore();
    this._stores[name] = modelStore;
    this.seedModel(name, model);
  }

  private seedModel<M extends ModelBase>(name: string, model: M) {
    const store: ModelStore<M> = this._stores[name];
    const instances = 10;
    for (let i = 0; i < instances; i++) {
      store.create(dummy_instance(model));
    }
    console.log(`Seeded ${instances} instances of ${name} model`);
  }
  public getModelStore<M extends ModelBase>(name: string): ModelStore<M> {
    if (!(name in this._stores)) {
      throw new Error(`Model ${name} not registered`);
    }
    return this._stores[name] as ModelStore<M>;
  }
}
