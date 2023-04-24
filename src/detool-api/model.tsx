import { UuidField } from "./field";

/*

Model defined in high level types that know there
1. representation (string, int, etc)
2. validation (email address, phone number, etc)
3. default view and edit controls (plain text, <input type="text" />, <input type="email" />)
4. fake values (faker.js)

*/

export interface ModelBase {
  id: typeof UuidField;
}

// interface to support the following interfaces:
// Person.list()
// Person.create({ ... })
// Person.get(id)
// Person.update(id, { ... })
// Person.delete(id)
export interface ModelAPI<M extends ModelBase> {
  [api]: {
    /** list all instances of this model */
    list: () => Promise<InstanceOf<M>[]>;
    /** create a new instance of this model, return null if id does not exist */
    create: (data: InstanceOf<M>) => Promise<InstanceOf<M> | null>;
    /** get an instance of this model by id, return null if id does not exist */
    get: (id: string) => Promise<InstanceOf<M> | null>;
    /** update an instance of this model by id, return null if id does not exist */
    update: (id: string, data: InstanceOf<M>) => Promise<InstanceOf<M> | null>;
    /** delete an instance of this model by id, return null if id does not exist */
    delete: (id: string) => Promise<InstanceOf<M> | null>;
  };
}

export interface Field<T> {
  dummy_value: () => T;
  view: (val: T) => React.ReactNode;
  edit: (val: T, update: (newValue: T) => void) => React.ReactNode;
  initial_value: () => T;
}

export type FieldType<T> = T extends Field<infer X> ? X : never;
export type InstanceOf<T> = { [Property in keyof T]: FieldType<T[Property]> };
export type CrudUI<T> = { [Property in keyof T]: React.ReactNode };

const _models = new Map<string, ModelBase>();

const getApiForModel = <M extends ModelBase>(
  _name: string,
  _model: M
): ModelAPI<M> => {
  return {
    [api]: {
      list: async () => {
        return [];
      },
      create: async (data: InstanceOf<M>) => {
        return null;
      },
      get: async (id: string) => {
        return null;
      },
      update: async (id: string, data: InstanceOf<M>) => {
        return null;
      },
      delete: async (id: string) => {
        return null;
      },
    },
  };
};

export const api = Symbol("detool/model/api");
/**
 *
 * @param modelName
 * @param rawModel
 * @returns
 */
export const Model = <M extends {}>(
  modelName: string,
  rawModel: M
): M & ModelBase & ModelAPI<M & ModelBase> => {
  const model = { ...rawModel, id: UuidField };
  if (!_models.has(modelName)) {
    // make idempotent
    _models.set(modelName, model);
  }
  return {
    ...model,
    ...getApiForModel(modelName, model),
  };
};

export const listModelNames = (): string[] => [..._models.keys()];
export const getModel = <M extends ModelBase>(
  modelName: string
): M | undefined => _models.get(modelName) as M | undefined;
