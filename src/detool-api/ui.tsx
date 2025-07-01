import { Row } from "../components/Row";
import { ModelBase, InstanceOf, Field, CrudUI, isComputedField, ComputedField, DatabaseInstanceOf } from "./model";

/* there's apparently no way to correctly type in typescript */
export function mapFields<M extends ModelBase>(
  obj: M,
  iteratee: <K extends keyof M["fields"]>(value: Field<unknown>, key: K) => any
): { [P in keyof M]: any } {
  return Object.fromEntries(
    Object.entries(obj.fields).map(([k, v]) => [
      k,
      iteratee(v as Field<unknown>, k as any),
    ])
  ) as any;
}

export async function mapFieldsAsync<M extends ModelBase>(
  obj: M,
  iteratee: <K extends keyof M["fields"]>(
    value: Field<unknown>,
    key: K
  ) => Promise<any>
): Promise<{ [P in keyof M]: any }> {
  const entriesPromises = Object.entries(obj.fields).map(async ([k, v]) => [
    k,
    await iteratee(v as Field<unknown>, k as any),
  ]);
  const entries = await Promise.all(entriesPromises);

  return Object.fromEntries(entries) as Promise<any>;
}

function zipFields<M extends ModelBase>(
  model: M,
  instance: InstanceOf<M>,
  fn: <T>(name: keyof M["fields"], field: Field<T>, value: T) => any
): { [P in keyof M["fields"]]: any } {
  return mapFields(model, (field: Field<any>, name: keyof M["fields"]) =>
    fn(name, field, instance[name])
  ) as any;
}

export async function dummy_instance<M extends ModelBase>(
  model: M
): Promise<InstanceOf<M>> {
  // First create dummy values for regular fields
  const regularFields = await mapFieldsAsync(model, async (field, name) => {
    if (isComputedField(field)) {
      return undefined; // We'll compute this later
    }
    return field.dummy_value();
  });

  // Now compute the computed fields based on the regular field values
  const computedFields = mapFields(model, (field, name) => {
    if (isComputedField(field)) {
      return (field as ComputedField<any, any>).computeFn(regularFields);
    }
    return (regularFields as any)[name];
  });

  return computedFields as InstanceOf<M>;
}

export function blank_instance<M extends ModelBase>(model: M): InstanceOf<M> {
  // First create initial values for regular fields
  const regularFields = mapFields(model, (field: Field<any>, name) => {
    if (isComputedField(field)) {
      return undefined; // We'll compute this later
    }
    return field.initial_value();
  });

  // Now compute the computed fields based on the regular field values
  const computedFields = mapFields(model, (field, name) => {
    if (isComputedField(field)) {
      return (field as ComputedField<any, any>).computeFn(regularFields);
    }
    return (regularFields as any)[name];
  });

  return computedFields as InstanceOf<M>;
}

// New function to compute values for computed fields given a database instance
export function enrichWithComputedFields<M extends ModelBase>(
  model: M,
  dbInstance: DatabaseInstanceOf<M>
): InstanceOf<M> {
  const enrichedInstance = { ...dbInstance } as any;

  // Compute values for computed fields
  Object.entries(model.fields).forEach(([fieldName, field]) => {
    if (isComputedField(field)) {
      enrichedInstance[fieldName] = (field as ComputedField<any, any>).computeFn(dbInstance);
    }
  });

  return enrichedInstance as InstanceOf<M>;
}

// New function to extract only the database fields from a full instance
export function extractDatabaseFields<M extends ModelBase>(
  model: M,
  instance: InstanceOf<M>
): DatabaseInstanceOf<M> {
  const dbInstance = {} as any;

  Object.entries(model.fields).forEach(([fieldName, field]) => {
    if (!isComputedField(field)) {
      dbInstance[fieldName] = instance[fieldName as keyof typeof instance];
    }
  });

  return dbInstance as DatabaseInstanceOf<M>;
}

export function view_ui<M extends ModelBase>(
  model: M,
  instance: InstanceOf<M>,
  props?: React.HTMLAttributes<HTMLDivElement>
): CrudUI<M> {
  return zipFields(model, instance, (name, field, value) => (
    // TODO: remove JSX from key
    <div {...props}>{field.view(value, name as string)}</div>
  ));
}

export function edit_ui<M extends ModelBase>(
  model: M,
  instance: InstanceOf<M>,
  update: (newInstance: InstanceOf<M>) => void
): CrudUI<M> {
  return zipFields(model, instance, (name, field, value) => {
    const updateField = (newValue: any) => {
      const newInstance = { ...instance, [name]: newValue };
      
      // Recompute all computed fields when any field changes
      Object.entries(model.fields).forEach(([computedFieldName, computedField]) => {
        if (isComputedField(computedField)) {
          newInstance[computedFieldName as keyof typeof newInstance] = 
            (computedField as ComputedField<any, any>).computeFn(newInstance);
        }
      });
      
      update(newInstance);
    };

    return field.edit(value, updateField, name as string);
  });
}

const SimpleForm = (props: { instance: any }) => {
  const { instance } = props;

  return (
    <div className="flex flex-col gap-4">
      {Object.keys(instance)
        .filter((k) => k !== "id")
        .map((k) => (
          <Row key={k} c={[k, instance[k]]} />
        ))}
    </div>
  );
};

export const DefaultForm = <M extends ModelBase>(props: {
  model: M;
  instance: CrudUI<M>;
}): React.ReactElement => {
  const DefaultFormComponent:
    | React.ComponentType<{ instance: CrudUI<M> }>
    | undefined = props.model.DefaultForm;
  const FormComponent = DefaultFormComponent ?? SimpleForm;

  return <FormComponent instance={props.instance} />;
};

export const DefaultDetailView = <M extends ModelBase>(props: {
  model: M;
  instance: InstanceOf<M>;
}): React.ReactElement => {
  return (
    <DefaultForm
      model={props.model}
      instance={view_ui(props.model, props.instance)}
    />
  );
};

export const DefaultEditView = <M extends ModelBase>(props: {
  model: M;
  instance: InstanceOf<M>;
  update: (newInstance: InstanceOf<M>) => void;
}): React.ReactElement => {
  return (
      <DefaultForm
        model={props.model}
        instance={edit_ui(props.model, props.instance, props.update)}
      />
  );
};

export type DbType = "varchar" | "integer" | "boolean" | "timestamp";
export type SqlTypesOf<M extends ModelBase> = {
  [P in keyof M["fields"]]: DbType;
};
export function model_sql_types<M extends ModelBase>(model: M): SqlTypesOf<M> {
  return mapFields(model, (field) => {
    // Skip computed fields for SQL schema generation
    if (isComputedField(field)) {
      return null; // This will be filtered out when creating the schema
    }

    const exampleValue = field.initial_value();
    if (exampleValue instanceof Date) {
      return "timestamp";
    } else if (typeof exampleValue === "string") {
      return "varchar";
    } else if (typeof exampleValue === "number") {
      return "integer";
    } else if (typeof exampleValue === "boolean") {
      return "boolean";
    } else {
      throw new Error("Unknown type");
    }
  }) as SqlTypesOf<M>;
}
