import _ from "lodash";
import { ModelBase, InstanceOf, CrudUI, Field } from "./api";

export function view_ui<M extends ModelBase>(
  model: M,
  instance: InstanceOf<M>
): CrudUI<M> {
  return _.mapValues(model, (field: Field<any>, name) => (
    <div className="flex-grow w-full">{field.view(instance[name])}</div>
  ));
}

export function edit_ui<M extends ModelBase>(
  model: M,
  instance: InstanceOf<M>,
  update: (newInstance: InstanceOf<M>) => void
): CrudUI<M> {
  return _.mapValues(
    model,
    (field: Field<any>, name) =>
      field.edit(instance[name], (newValue) =>
        update({ ...instance, [name]: newValue })
      ) as any
  );
}
