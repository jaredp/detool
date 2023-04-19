import * as React from "react";
import _ from "lodash";
import { ModelBase, Field, InstanceOf, CrudUI } from "./api";
import { Row } from "./components/Row";
import { Person, PersonForm } from "./models/Person";
import { AppLayout } from "./components/AppLayout";
import { AdminTable } from "./components/AdminTable";
import { edit_ui, view_ui } from "./ui";
import { Button } from "flowbite-react";

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
    <div className="flex flex-col">
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
    <div>
      {detail_view(edit_ui(model, dirtyInstance, setDirtyInstance))}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button
          children="cancel"
          onClick={() => {
            props.cancel();
          }}
        />
        <Button
          children="add"
          onClick={() => {
            props.save(dirtyInstance);
          }}
        />
      </div>
    </div>
  );
};

const new_instance_symbol = Symbol("new instance");

export default function App() {
  const [people, setPeople] = React.useState(
    (_.range(100) as number[]).map((_i) => dummy_instance(Person))
  );

  const [selectedUuid, setSelectedUuid] = React.useState<
    string | typeof new_instance_symbol | null
  >(null);
  const selected = people.find((p) => p.id === selectedUuid);

  const body =
    selectedUuid === new_instance_symbol ? (
      <div>
        <NewInstancePage
          model={Person}
          detail_view={(p) => <PersonForm person={p} />}
          cancel={() => setSelectedUuid(null)}
          save={(new_person) => {
            setPeople((oldPeople) => [new_person, ...oldPeople]);
            setSelectedUuid(new_person.id);
          }}
        />
      </div>
    ) : !selected ? (
      <div>
        <Row
          c={[
            <p>Click any rows below to edit them</p>,
            <Button
              children="New +"
              onClick={() => setSelectedUuid(new_instance_symbol)}
            />,
          ]}
        />
        <AdminTable
          model={Person}
          instances={people}
          onSelected={(person) => setSelectedUuid(person.id)}
        />
      </div>
    ) : (
      <div>
        <div>
          <Button children="back" onClick={() => setSelectedUuid(null)} />
        </div>

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
      </div>
    );

  return <AppLayout body={body} />;
}
