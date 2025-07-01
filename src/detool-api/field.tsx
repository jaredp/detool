import { faker } from "@faker-js/faker";
import { LinkIcon, EnvelopeIcon, PhoneIcon } from "@heroicons/react/24/solid";
import { TextInput, Textarea } from "flowbite-react";
import { Field } from "./model";
import nodeCrypto from "crypto";
import { humanize_label } from "./name_utils";

const getFaker = async () => {
  const { faker } = await import("@faker-js/faker");
  return faker;
};

const randomUUID = (): string => {
  if (typeof nodeCrypto?.randomUUID === "function") {
    return nodeCrypto.randomUUID();
  }
  return (globalThis?.crypto?.randomUUID() as string) || "some-uuid";
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
  dummy_value: async () => (await getFaker()).datatype.boolean(),
  initial_value: () => false,
  view: (val, fieldName) => (
    <div className="flex w-full flex-grow items-baseline">
      <input type="checkbox" className="mx-2" checked={val} readOnly disabled />
      <span>{humanize_label(fieldName)}</span>
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
        <span>{humanize_label(fieldName)}</span>
      </div>
    );
  },
};

export const ShortText: Field<string> = {
  dummy_value: async () => (await getFaker()).lorem.words(),
  initial_value: () => "",
  view: (val) => val,
  edit: (val, update, fieldName) => (
    <TextInput
      type="text"
      placeholder={humanize_label(fieldName)}
      value={val}
      onChange={(e) => update(e.target.value)}
      className="w-full flex-grow"
    />
  ),
};

export const UrlField: Field<string> = {
  dummy_value: async () => (await getFaker()).internet.url(),
  initial_value: () => "",
  view: (val) => (
    <a href={val} className="font-medium text-blue-600 ">
      {val}
    </a>
  ),
  edit: (val, update) => (
    <TextInput
      icon={LinkIcon as any}
      type="url"
      placeholder="https://..."
      value={val}
      onChange={(e) => update(e.target.value)}
      className="w-full flex-grow"
    />
  ),
};

export const EmailAddress: Field<string> = {
  dummy_value: async () => (await getFaker()).internet.email(),
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
  dummy_value: async () => (await getFaker()).phone.number(),
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
  dummy_value: async () => (await getFaker()).lorem.paragraph(),
  initial_value: () => "",
  view: (val) => val,
  edit: (val, update, fieldName) => (
    <Textarea
      value={val}
      onChange={(e) => update(e.target.value)}
      placeholder={humanize_label(fieldName)}
      className="w-full flex-grow"
    />
  ),
};

// TODO add null type
export const Optional = <T,>(field: Field<T>): Field<T> => field;

// New computed field types
export interface ComputedField<T, TInstance = any> extends Field<T> {
  isComputed: true;
  computeFn: (instance: TInstance) => T;
  sqlExpression?: string; // Optional SQL expression for database-level computation
}

export const ComputedString = <TInstance = any>(
  computeFn: (instance: TInstance) => string,
  options?: {
    sqlExpression?: string;
    displayFormat?: (val: string) => React.ReactNode;
  }
): ComputedField<string, TInstance> => ({
  isComputed: true,
  computeFn,
  sqlExpression: options?.sqlExpression,
  dummy_value: async () => "computed_value",
  initial_value: () => "",
  view: (val) => options?.displayFormat ? options.displayFormat(val) : val,
  edit: (val, _update, fieldName) => (
    <div className="flex items-center px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
      <span className="text-gray-500 text-sm italic">
        {humanize_label(fieldName)} (computed)
      </span>
      <span className="ml-2 font-medium">{val}</span>
    </div>
  ),
});

export const ComputedNumber = <TInstance = any>(
  computeFn: (instance: TInstance) => number,
  options?: {
    sqlExpression?: string;
    displayFormat?: (val: number) => React.ReactNode;
  }
): ComputedField<number, TInstance> => ({
  isComputed: true,
  computeFn,
  sqlExpression: options?.sqlExpression,
  dummy_value: async () => 42,
  initial_value: () => 0,
  view: (val) => options?.displayFormat ? options.displayFormat(val) : val.toString(),
  edit: (val, _update, fieldName) => (
    <div className="flex items-center px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
      <span className="text-gray-500 text-sm italic">
        {humanize_label(fieldName)} (computed)
      </span>
      <span className="ml-2 font-medium">{val}</span>
    </div>
  ),
});

export const ComputedDate = <TInstance = any>(
  computeFn: (instance: TInstance) => Date,
  options?: {
    sqlExpression?: string;
    displayFormat?: (val: Date) => React.ReactNode;
  }
): ComputedField<Date, TInstance> => ({
  isComputed: true,
  computeFn,
  sqlExpression: options?.sqlExpression,
  dummy_value: async () => new Date(),
  initial_value: () => new Date(),
  view: (val) => options?.displayFormat ? options.displayFormat(val) : val.toISOString().slice(0, 10),
  edit: (val, _update, fieldName) => (
    <div className="flex items-center px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
      <span className="text-gray-500 text-sm italic">
        {humanize_label(fieldName)} (computed)
      </span>
      <span className="ml-2 font-medium">{val.toISOString().slice(0, 10)}</span>
    </div>
  ),
});

export const ComputedBoolean = <TInstance = any>(
  computeFn: (instance: TInstance) => boolean,
  options?: {
    sqlExpression?: string;
    displayFormat?: (val: boolean) => React.ReactNode;
  }
): ComputedField<boolean, TInstance> => ({
  isComputed: true,
  computeFn,
  sqlExpression: options?.sqlExpression,
  dummy_value: async () => true,
  initial_value: () => false,
  view: (val, fieldName) => options?.displayFormat ? options.displayFormat(val) : (
    <div className="flex w-full flex-grow items-baseline">
      <input type="checkbox" className="mx-2" checked={val} readOnly disabled />
      <span>{humanize_label(fieldName)} (computed)</span>
    </div>
  ),
  edit: (val, _update, fieldName) => (
    <div className="flex items-center px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
      <input type="checkbox" className="mx-2" checked={val} readOnly disabled />
      <span className="text-gray-500 text-sm italic">
        {humanize_label(fieldName)} (computed)
      </span>
    </div>
  ),
});
