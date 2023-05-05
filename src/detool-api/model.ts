import { trpc } from "../utils/trpc";
import { UuidField } from "./field";
import { CrudApiHooks } from "./trpc_api";

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
  fields: Fields & {id: typeof UuidField};

  name: string;
  tablename: string;
  routename: string;

  // We're lying to Typescript about types for ModelBase, so we're going to continue to lie and put
  // an `any` here. The actual type is
  //   DefaultForm?: React.ComponentType<{instance: CrudUI<this>}>;
  DefaultForm?: React.ComponentType<{instance: any}>;
}

export type FieldType<T> = T extends Field<infer X> ? X : never;
export type InstanceOf<T extends ModelBase> = { [Property in keyof T["fields"]]: FieldType<T["fields"][Property]> };
export type CrudUI<T extends ModelBase> = { [Property in keyof T["fields"]]: React.ReactNode };

const _models = new Map<string, ModelBase>();
export const listModelNames = (): string[] => [..._models.keys()];

export interface EnrichedModel<Fields extends {[field_name: string]: Field<any>} = {}> extends ModelBase<Fields> {
  hooks: CrudApiHooks<this>;
}

export const Model = <FieldsSrc extends {[field_name: string]: Field<any>}>(
  modelName: string,
  fields_src: FieldsSrc,
  options?: {
    DefaultForm?: React.ComponentType<{instance: CrudUI<ModelBase<FieldsSrc>>}>;
  }
): EnrichedModel<FieldsSrc> => {
  if (_models.has(modelName)) {
    throw new Error(`Two models named ${modelName}. Or, model ${modelName} was somehow loaded twice.`);
  }

  const fields = { ...fields_src, id: UuidField };
  const unix_safe_name = modelName.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase()
  const routename = unix_safe_name

  const model = {
    fields,

    name: modelName,
    tablename: unix_safe_name,
    routename: routename,

    // client-side only. Pretty much a hack. Not totally clear long term what the client
    // and/or server interfaces look like
    hooks: typeof window === "undefined" ? null as any : trpc.detool_crud[routename],

    ...(options ?? {}),
  };

  _models.set(modelName, model);

  return model;
};
