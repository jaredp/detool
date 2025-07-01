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
  dummy_value: () => Promise<T> | T;
  view: (val: T, fieldName: string) => React.ReactNode;
  edit: (
    val: T,
    update: (newValue: T) => void,
    fieldName: string
  ) => React.ReactNode;
  initial_value: () => T;
}

export interface ComputedField<T, TInstance = any> extends Field<T> {
  isComputed: true;
  computeFn: (instance: TInstance) => T;
  sqlExpression?: string;
}

// Type guard to check if a field is computed
export const isComputedField = <T>(field: Field<T>): field is ComputedField<T> => {
  return 'isComputed' in field && (field as any).isComputed === true;
};

export interface ModelBase<
  Fields extends { [field_name: string]: Field<any> } = {}
> {
  fields: Fields & { id: typeof UuidField };

  name: string;
  tablename: string;
  routename: string;

  // We're lying to Typescript about types for ModelBase, so we're going to continue to lie and put
  // an `any` here. The actual type is
  //   DefaultForm?: React.ComponentType<{instance: CrudUI<this>}>;
  DefaultForm?: React.ComponentType<{ instance: any }>;
}

export type FieldType<T> = T extends Field<infer X> ? X : never;

// Helper type to separate regular fields from computed fields
export type RegularFields<T extends ModelBase> = {
  [K in keyof T["fields"]]: T["fields"][K] extends ComputedField<any> ? never : K;
}[keyof T["fields"]];

export type ComputedFields<T extends ModelBase> = {
  [K in keyof T["fields"]]: T["fields"][K] extends ComputedField<any> ? K : never;
}[keyof T["fields"]];

// Instance type includes all fields (regular + computed)
export type InstanceOf<T extends ModelBase> = {
  [Property in keyof T["fields"]]: FieldType<T["fields"][Property]>;
};

// Database instance type only includes regular fields (computed fields are calculated)
export type DatabaseInstanceOf<T extends ModelBase> = {
  [Property in RegularFields<T>]: FieldType<T["fields"][Property]>;
};

export type CrudUI<T extends ModelBase> = {
  [Property in keyof T["fields"]]: React.ReactNode;
};

const _models = new Map<string, ModelBase>();
export const listModelNames = (): string[] => [..._models.keys()];

export interface EnrichedModel<
  Fields extends { [field_name: string]: Field<any> } = {}
> extends ModelBase<Fields> {
  hooks: CrudApiHooks<this>;
}

export const Model = <FieldsSrc extends { [field_name: string]: Field<any> }>(
  modelName: string,
  fields_src: FieldsSrc,
  options?: {
    DefaultForm?: React.ComponentType<{
      instance: CrudUI<ModelBase<FieldsSrc>>;
    }>;
  }
): EnrichedModel<FieldsSrc> => {
  if (_models.has(modelName)) {
    throw new Error(
      `Two models named ${modelName}. Or, model ${modelName} was somehow loaded twice.`
    );
  }

  const fields = { ...fields_src, id: UuidField };
  const unix_safe_name = modelName.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
  const routename = unix_safe_name;

  const model = {
    fields,

    name: modelName,
    tablename: unix_safe_name,
    routename: routename,

    // client-side only. Pretty much a hack. Not totally clear long term what the client
    // and/or server interfaces look like
    hooks:
      typeof window === "undefined"
        ? (null as any)
        : trpc.detool_crud[routename],

    ...(options ?? {}),
  };

  _models.set(modelName, model);

  return model;
};
