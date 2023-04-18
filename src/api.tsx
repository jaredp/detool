import { faker } from "@faker-js/faker";
import { v4 as uuidv4 } from "uuid";

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

export const UuidField: Field<string> = {
  dummy_value: () => uuidv4(),
  initial_value: () => uuidv4(),
  view: (val) => val,
  edit: (val, _update) => <input type="input" readOnly disabled value={val} />,
};

export const DateField: Field<Date> = {
  dummy_value: () => new Date(),
  initial_value: () => new Date(),
  view: (val) => val.toString(),
  edit: (val, update) => (
    <input
      type="date"
      value={val.toISOString().slice(0, 10)}
      onChange={(e) => update(new Date(e.target.value))}
    />
  ),
};

export const ShortText: Field<string> = {
  dummy_value: () => faker.lorem.words(),
  initial_value: () => "",
  view: (val) => val,
  edit: (val, update) => (
    <input
      type="text"
      value={val}
      onChange={(e) => update(e.target.value)}
      style={{ width: "100%" }}
    />
  ),
};

export const EmailAddress: Field<string> = {
  dummy_value: () => faker.internet.email(),
  initial_value: () => "",
  view: (val) => val,
  edit: (val, update) => (
    <input
      type="email"
      value={val}
      onChange={(e) => update(e.target.value)}
      style={{ width: "100%" }}
    />
  ),
};

export const LongText: Field<string> = {
  dummy_value: () => faker.lorem.paragraph(),
  initial_value: () => "",
  view: (val) => val,
  edit: (val, update) => (
    <textarea
      value={val}
      onChange={(e) => update(e.target.value)}
      style={{ width: "100%" }}
    />
  ),
};

export const Optional = (_ignore: any) => ShortText;
