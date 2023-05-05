import { ModelStore } from "../server/stores/api";
import { UuidField } from "./field";
import { getApiForModel } from "./state";

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

export interface ModelAPI<M extends ModelBase> {
  __serverApi: ModelStore<M>;
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

/**
 *
 * @param modelName
 * @param rawModel
 * @returns
 */
export const Model = <M extends {}>(
  modelName: string,
  rawModel: M
): M & ModelBase => {
  if (_models.has(modelName)) {
    throw new Error(`Two models named ${modelName}. Or, model ${modelName} was somehow loaded twice.`);
  }

  const model = { ...rawModel, id: UuidField };
  _models.set(modelName, model);

  return {
    ...model,
    ...getApiForModel(modelName, model),
  };
};

export const listModelNames = (): string[] => [..._models.keys()];
export const getModel = <M extends ModelBase>(
  modelName: string
): M | undefined => _models.get(modelName) as M | undefined;
