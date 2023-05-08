import { faker } from "@faker-js/faker";
import { LinkIcon, EnvelopeIcon, PhoneIcon } from "@heroicons/react/24/solid";
import { TextInput, Textarea } from "flowbite-react";
import { Field } from "./model";
import nodeCrypto from "crypto";

const randomUUID = (): string => {
  if (typeof nodeCrypto?.randomUUID === "function") {
    return nodeCrypto.randomUUID();
  }
  if (typeof globalThis?.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }
  return faker.datatype.uuid();
};

export const UuidField: Field<string> = {
  dummy_value: () => randomUUID(),
  initial_value: () => randomUUID(),
  view: (val) => val,
  edit: (val, _update) => <input type="input" readOnly disabled value={val} />,
};

export const DateField: Field<Date> = {
  dummy_value: () => new Date(),
  initial_value: () => new Date(),
  view: (val) => val.toISOString().slice(0, 10),
  edit: (val, update) => (
    <TextInput
      type="date"
      value={val.toISOString().slice(0, 10)}
      onChange={(e) => update(new Date(e.target.value))}
      className="w-full flex-grow"
    />
  ),
};

export const Checkbox: Field<boolean> = {
  dummy_value: () => faker.datatype.boolean(),
  initial_value: () => false,
  view: (val, fieldName) => (
    <div className="flex w-full flex-grow items-baseline">
      <input type="checkbox" className="mx-2" checked={val} readOnly disabled />
      <span>{fieldName}</span>
    </div>
  ),
  edit: (val, update, fieldName) => {
    return (
      <div className="flex w-full flex-grow items-baseline self-center">
        <input
          type="checkbox"
          className="mx-2"
          checked={val}
          onChange={(e) => update(e.target.checked)}
        />
        <span>{fieldName}</span>
      </div>
    );
  },
};

export const ShortText: Field<string> = {
  dummy_value: () => faker.lorem.words(),
  initial_value: () => "",
  view: (val) => val,
  edit: (val, update) => (
    <TextInput
      type="text"
      value={val}
      onChange={(e) => update(e.target.value)}
      className="w-full flex-grow"
    />
  ),
};

export const UrlField: Field<string> = {
  dummy_value: () => faker.internet.url(),
  initial_value: () => "",
  view: (val) => (
    <a href={val} className="font-medium text-blue-600 ">
      {val}
    </a>
  ),
  edit: (val, update) => (
    <TextInput
      type="url"
      icon={LinkIcon as any}
      value={val}
      onChange={(e) => update(e.target.value)}
      className="w-full flex-grow"
    />
  ),
};

export const EmailAddress: Field<string> = {
  dummy_value: () => faker.internet.email(),
  initial_value: () => "",
  view: (val) => (
    <a href={`mailto:${val}`} className="font-medium text-blue-600 ">
      {val}
    </a>
  ),
  edit: (val, update) => (
    <TextInput
      type="email"
      placeholder="you@example.com"
      icon={EnvelopeIcon as any}
      value={val}
      onChange={(e) => update(e.target.value)}
      className="w-full flex-grow"
    />
  ),
};

export const PhoneNumber: Field<string> = {
  dummy_value: () => faker.phone.number(),
  initial_value: () => "",
  view: (val) => (
    <a href={`tel:${val}`} className="font-medium text-blue-600 ">
      {val}
    </a>
  ),
  edit: (val, update) => (
    <TextInput
      type="tel"
      placeholder="(999) 999-9999"
      icon={PhoneIcon as any}
      value={val}
      onChange={(e) => update(e.target.value)}
      className="w-full flex-grow"
    />
  ),
};

export const LongText: Field<string> = {
  dummy_value: () => faker.lorem.paragraph(),
  initial_value: () => "",
  view: (val) => val,
  edit: (val, update) => (
    <Textarea
      value={val}
      onChange={(e) => update(e.target.value)}
      className="w-full flex-grow"
    />
  ),
};

// TODO add null type
export const Optional = <T,>(field: Field<T>): Field<T> => field;
