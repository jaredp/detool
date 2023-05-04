import { ModelBase, InstanceOf, Field, CrudUI } from "./model";

function mapValues<M extends object, R>(
  obj: { [P in keyof M]: M[P] },
  iteratee: (value: any, key: string & keyof M) => R
): { [P in keyof M]: R } {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k, iteratee(v, k as any)])
  ) as any;
}

export function dummy_instance<M extends ModelBase>(model: M): InstanceOf<M> {
  return mapValues(model, (field: Field<any>) =>
    field.dummy_value()
  ) as InstanceOf<M>;
}

export function blank_instance<M extends ModelBase>(model: M): InstanceOf<M> {
  return mapValues(model, (field: Field<any>) =>
    field.initial_value()
  ) as InstanceOf<M>;
}

export function view_ui<M extends ModelBase>(
  model: M,
  instance: InstanceOf<M>,
  props?: React.HTMLAttributes<HTMLDivElement>
): CrudUI<M> {
  return mapValues(model, (field: Field<any>, name: string & keyof M) => (
    // TODO: remove JSX from key
    <div {...props}>{field.view(instance[name])}</div>
  )) as CrudUI<M>;
}

export function edit_ui<M extends ModelBase>(
  model: M,
  instance: InstanceOf<M>,
  update: (newInstance: InstanceOf<M>) => void
): CrudUI<M> {
  return mapValues(model, (field: Field<any>, name: string & keyof M) =>
    field.edit((instance as any)[name], (newValue) =>
      update({ ...instance, [name]: newValue })
    )
  ) as CrudUI<M>;
}
