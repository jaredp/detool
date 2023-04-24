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

export interface Field<T> {
  dummy_value: () => T;
  view: (val: T) => React.ReactNode;
  edit: (val: T, update: (newValue: T) => void) => React.ReactNode;
  initial_value: () => T;
}

export type FieldType<T> = T extends Field<infer X> ? X : never;
export type InstanceOf<T> = { [Property in keyof T]: FieldType<T[Property]> };
export type CrudUI<T> = { [Property in keyof T]: React.ReactNode };

export const Model = <M extends ModelBase>(model: M): M => model;
