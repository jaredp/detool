import _ from "lodash";
import { ModelBase, InstanceOf, CrudUI, Field } from "./api";

export function view_ui<M extends ModelBase>(
  model: M,
  instance: InstanceOf<M>
): CrudUI<M> {
  return _.mapValues(model, (field: Field<any>, name: string) => (
    <div className="w-full flex-grow">{field.view((instance as any)[name])}</div>
  ));
}

export function edit_ui<M extends ModelBase>(
  model: M,
  instance: InstanceOf<M>,
  update: (newInstance: InstanceOf<M>) => void
): CrudUI<M> {
  return _.mapValues(
    model,
    (field: Field<any>, name: string) =>
      field.edit((instance as any)[name], (newValue) =>
        update({ ...instance, [name]: newValue })
      ) as any
  );
}
