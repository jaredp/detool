import * as React from "react";
import _ from "lodash";
import { ModelBase, Field, InstanceOf, CrudUI } from "./api";
import { Row } from "./components/Row";
import { Person, PersonForm } from "./models/Person";
import { AppLayout } from "./components/AppLayout";
import { AdminTable } from "./components/AdminTable";
import { edit_ui, view_ui } from "./ui";
import { Button } from "flowbite-react";
import { PlusIcon } from "@heroicons/react/24/solid";
import { Modal } from "./components/Modal";

function dummy_instance<M extends ModelBase>(model: M): InstanceOf<M> {
  return _.mapValues(model, (field: Field<any>) => field.dummy_value()) as any;
}

function blank_instance<M extends ModelBase>(model: M): InstanceOf<M> {
  return _.mapValues(model, (field: Field<any>) =>
    field.initial_value()
  ) as any;
}

const EditableCrud = <M extends ModelBase>(props: {
  model: M;
  detail_view: (crud_ctrls: CrudUI<M>) => React.ReactNode;
  instance: InstanceOf<M>;
  update: (newInstance: InstanceOf<M>) => void;
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
      <Button
        children="edit"
        onClick={() => {
          setDirtyInstance(props.instance);
        }}
      />
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
      <h3 className="text-xl font-medium text-gray-900 pb-2">
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

export default function App() {
  const [people, setPeople] = React.useState(
    (_.range(1000) as number[]).map((_i) => dummy_instance(Person))
  );

  const [selectedUuid, setSelectedUuid] = React.useState<
    string | typeof new_instance_symbol | null
  >(null);
  const selected = people.find((p) => p.id === selectedUuid);

  const modal = !selectedUuid ? null : (
    <Modal
      show={true}
      onClose={() => setSelectedUuid(null)}
      children={
        selectedUuid === new_instance_symbol ? (
          <>
            <NewInstancePage
              model={Person}
              detail_view={(p) => <PersonForm person={p} />}
              cancel={() => setSelectedUuid(null)}
              save={(new_person) => {
                setPeople((oldPeople) => [new_person, ...oldPeople]);
                setSelectedUuid(new_person.id);
              }}
            />
          </>
        ) : (
          <EditableCrud
            model={Person}
            detail_view={(p) => <PersonForm person={p} />}
            instance={selected}
            update={(updated_person) => {
              setPeople((oldPeople) =>
                oldPeople.map((person) =>
                  person.id === updated_person.id ? updated_person : person
                )
              );
            }}
          />
        )
      }
    />
  );

  const body = (
    <div>
      <Row
        c={[
          <p>Click any rows below to edit them</p>,
          <Button
            color="success"
            onClick={() => setSelectedUuid(new_instance_symbol)}
          >
            {"Add"}
            <PlusIcon className="ml-2 h-4 w-4" />
          </Button>,
        ]}
      />
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
