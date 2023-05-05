import { UuidField } from "./field";

/*

Model defined in high level types that know there
1. representation (string, int, etc)
2. validation (email address, phone number, etc)
3. default view and edit controls (plain text, <input type="text" />, <input type="email" />)
4. fake values (faker.js)

*/

export interface Field<T> {
  dummy_value: () => T;
  view: (val: T) => React.ReactNode;
  edit: (val: T, update: (newValue: T) => void) => React.ReactNode;
  initial_value: () => T;
}

export interface ModelBase<Fields extends {[field_name: string]: Field<any>} = {}> {
  name: string;
  fields: Fields & {id: typeof UuidField};
}

export type UnknownModel = ModelBase<{[field_name: string]: Field<unknown>}>;

export type FieldType<T> = T extends Field<infer X> ? X : never;
export type InstanceOf<T extends ModelBase> = { [Property in keyof T["fields"]]: FieldType<T["fields"][Property]> };
export type CrudUI<T extends ModelBase> = { [Property in keyof T["fields"]]: React.ReactNode };

const _models = new Map<string, ModelBase>();

/**
 *
 * @param modelName
 * @param rawModel
 * @returns
 */
export const Model = <FieldsSrc extends {[field_name: string]: Field<any>}>(
  modelName: string,
  fields_src: FieldsSrc
): ModelBase<FieldsSrc> => {
  if (_models.has(modelName)) {
    throw new Error(`Two models named ${modelName}. Or, model ${modelName} was somehow loaded twice.`);
  }

  const fields = { ...fields_src, id: UuidField };
  const model = {
    name: modelName,
    fields,
  };

  _models.set(modelName, model);

  return model;
};

export const listModelNames = (): string[] => [..._models.keys()];
