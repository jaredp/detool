import * as React from "react";
import _, { create, update } from "lodash";
import {
  ModelBase,
  Field,
  InstanceOf,
  CrudUI,
  blank_instance,
  dummy_instance,
} from "./api";
import { Row } from "./components/Row";
import { Person, PersonForm } from "./models/Person";
import { AppLayout } from "./components/AppLayout";
import { AdminTable } from "./components/AdminTable";
import { edit_ui, view_ui } from "./ui";
import { Button } from "flowbite-react";
import { PlusIcon } from "@heroicons/react/24/solid";
import { Modal } from "./components/Modal";

const EditableCrud = <M extends ModelBase>(props: {
  model: M;
  detail_view: (crud_ctrls: CrudUI<M>) => React.ReactNode;
  instance: InstanceOf<M>;
  update: (newInstance: InstanceOf<M>) => void;
  delete: () => void;
}): React.ReactElement => {
  const { model, detail_view } = props;

  const layout = (slots: {
    crud_ctrls: CrudUI<M>;
    actions: React.ReactNode;
  }) => (
    <div className="flex flex-col gap-4">
      <h3 className="text-xl font-medium text-gray-900">Edit</h3>
      {detail_view(slots.crud_ctrls)}
      <div className="flex justify-end">{slots.actions}</div>
    </div>
  );

  const [dirtyInstance, setDirtyInstance] =
    React.useState<InstanceOf<M> | null>(null);

  if (dirtyInstance) {
    return layout({
      crud_ctrls: edit_ui(model, dirtyInstance, setDirtyInstance),
      actions: (
        <Button.Group>
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
        </Button.Group>
      ),
    });
  }

  return layout({
    crud_ctrls: view_ui(model, props.instance),
    actions: (
      <Button.Group>
        <Button
          color="red"
          children="delete"
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
          children="edit"
          onClick={() => {
            setDirtyInstance(props.instance);
          }}
        />
      </Button.Group>
    ),
  });
};

const NewInstancePage = <M extends ModelBase>(props: {
  model: M;
  detail_view: (crud_ctrls: CrudUI<M>) => React.ReactNode;
  save: (newInstance: InstanceOf<M>) => void;
  cancel: () => void;
}): React.ReactElement => {
  const { model, detail_view } = props;

  const [dirtyInstance, setDirtyInstance] = React.useState<InstanceOf<M>>(
    blank_instance(model)
  );
  return (
    <div className="flex flex-col gap-4 ">
      <h3 className="pb-2 text-xl font-medium text-gray-900">
        Create new instance
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

const new_instance_symbol = Symbol("new instance");
import { trpc } from "./utils/trpc";
import { Loading } from "./components/Loading";

export default function App() {
  const [selectedUuid, setSelectedUuid] = React.useState<
    string | typeof new_instance_symbol | null
  >(null);
  const result = trpc.model_instance.list.useQuery();
  const createHook = trpc.model_instance.create.useMutation();
  const updateHook = trpc.model_instance.update.useMutation();
  const deleteHook = trpc.model_instance.delete.useMutation();

  if (!result.data) {
    return <Loading />;
  }

  const people: InstanceOf<typeof Person>[] = result.data as any;
  const selected = people.find((p) => p.id === selectedUuid);

  const modal = !selectedUuid ? null : (
    <Modal
      show={true}
      onClose={() => setSelectedUuid(null)}
      children={
        selectedUuid === new_instance_symbol ? (
          <NewInstancePage
            model={Person}
            detail_view={(p) => <PersonForm instance={p} />}
            cancel={() => setSelectedUuid(null)}
            save={async (new_person) => {
              await createHook.mutate({
                data: new_person,
              });
              setSelectedUuid(null);
              result.refetch();
            }}
          />
        ) : (
          <EditableCrud
            model={Person}
            detail_view={(p) => <PersonForm instance={p} />}
            instance={selected!}
            update={async (updated_person) => {
              await updateHook.mutate({
                id: updated_person.id,
                data: updated_person,
              });
              setSelectedUuid(null);
              result.refetch();
            }}
            delete={async () => {
                await deleteHook.mutate({
                    id: selected!.id,
                });
                setSelectedUuid(null);
                result.refetch();
            }}
          />
        )
      }
    />
  );

  const body = (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <span className="flex-grow text-sm text-gray-500 ">
          Loaded {people.length} instances. Click any rows below to edit them
        </span>
        <Button
          color="success"
          size={"xs"}
          onClick={() => setSelectedUuid(new_instance_symbol)}
        >
          {"Add"}
          <PlusIcon className="ml-2 h-4 w-4" />
        </Button>
      </div>
      <AdminTable
        model={Person}
        instances={people}
        onSelected={(person) => setSelectedUuid(person.id)}
      />
      {modal}
    </div>
  );

  return <AppLayout body={body} />;
}
