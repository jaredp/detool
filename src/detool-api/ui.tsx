import _ from "lodash";
import { ModelBase, InstanceOf, Field, CrudUI } from "./model";

export function dummy_instance<M extends ModelBase>(model: M): InstanceOf<M> {
  return _.mapValues(model, (field: Field<any>) =>
    field.dummy_value()
  ) as InstanceOf<M>;
}

export function blank_instance<M extends ModelBase>(model: M): InstanceOf<M> {
  return _.mapValues(model, (field: Field<any>) =>
    field.initial_value()
  ) as any;
}

export function view_ui<M extends ModelBase>(
  model: M,
  instance: InstanceOf<M>,
  props?: React.HTMLAttributes<HTMLDivElement>
): CrudUI<M> {
  return _.mapValues(model, (field: Field<any>, name: string & keyof M) => (
    // TODO: remove JSX from key
    <div {...props}>{field.view(instance[name])}</div>
  ));
}

export function edit_ui<M extends ModelBase>(
  model: M,
  instance: InstanceOf<M>,
  update: (newInstance: InstanceOf<M>) => void
): CrudUI<M> {
  return _.mapValues(model, (field: Field<any>, name: string & keyof M) =>
    field.edit((instance as any)[name], (newValue) =>
      update({ ...instance, [name]: newValue })
    )
  );
}
