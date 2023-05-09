import * as React from "react";
import { blank_instance, edit_ui, view_ui } from "./ui";
import { Button } from "flowbite-react";
import { CrudUI, InstanceOf, ModelBase } from "./model";
import { FocusOnMount, useRefAndFocus } from "../utils/useFocusOnMount";

export const EditableCrud = <M extends ModelBase>(props: {
  model: M;
  detail_view: (crud_ctrls: CrudUI<M>) => React.ReactNode;
  instance: InstanceOf<M>;
  update: (newInstance: InstanceOf<M>) => void;
  delete: () => void;
}): React.ReactElement => {
  const { model, detail_view } = props;

  const [dirtyInstance, setDirtyInstance] =
    React.useState<InstanceOf<M> | null>(null);

  if (dirtyInstance) {
    return (
      <FocusOnMount>
        <div className="flex flex-col gap-4">
          {detail_view(edit_ui(model, dirtyInstance, setDirtyInstance))}
          <div className="flex justify-end gap-2">
            <Button
              color="gray"
              children="cancel"
              onClick={() => {
                setDirtyInstance(null);
              }}
            />
            <Button
              children="save"
              onClick={() => {
                props.update(dirtyInstance);
                setDirtyInstance(null);
              }}
            />
          </div>
        </div>
      </FocusOnMount>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {detail_view(view_ui(model, props.instance, {
        className: "w-full flex-grow",
      }))}
      <div className="flex justify-between">
        <Button
          color="red"
          children="Delete"
          onClick={() => {
            const result = confirm(
              "Are you sure you want to delete this instance?"
            );
            if (result) {
              props.delete();
            }
          }}
        />
        <Button
          children="Edit"
          onClick={() => {
            setDirtyInstance(props.instance);
          }}
        />
      </div>
    </div>
  );
};

export const NewInstancePage = <M extends ModelBase>(props: {
  model: M;
  detail_view: (crud_ctrls: CrudUI<M>) => React.ReactNode;
  save: (newInstance: InstanceOf<M>) => void;
  cancel: () => void;
}): React.ReactElement => {
  const { model, detail_view } = props;

  const [dirtyInstance, setDirtyInstance] = React.useState<InstanceOf<M>>(
    blank_instance(model)
  );

  const formRef = useRefAndFocus<HTMLDivElement>();
  return (
    <div className="flex flex-col gap-4" ref={formRef}>
      <h3 className="pb-2 text-xl font-medium text-gray-900">
        Add new {model.name}
      </h3>
      {detail_view(edit_ui(model, dirtyInstance, setDirtyInstance))}
      <Button.Group className="flex justify-end">
        <Button color="gray" children="cancel" onClick={() => props.cancel()} />
        <Button
          color="success"
          children="add"
          onClick={() => props.save(dirtyInstance)}
        />
      </Button.Group>
    </div>
  );
};
