import * as React from "react";
import _ from "lodash";
import "./style.css";
import { ModelBase, Field, InstanceOf, CrudUI } from "./api";
import { Row } from "./components";
import { Person, PersonForm } from "./models/Person";

function dummy_instance<M extends ModelBase>(model: M): InstanceOf<M> {
  return _.mapValues(model, (field: Field<any>) => field.dummy_value()) as any;
}

function blank_instance<M extends ModelBase>(model: M): InstanceOf<M> {
  return _.mapValues(model, (field: Field<any>) =>
    field.initial_value()
  ) as any;
}

function view_ui<M extends ModelBase>(
  model: M,
  instance: InstanceOf<M>
): CrudUI<M> {
  return _.mapValues(model, (field: Field<any>, name) =>
    field.view(instance[name])
  );
}

function edit_ui<M extends ModelBase>(
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
    <div>
      {detail_view(slots.crud_ctrls)}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        {slots.actions}
      </div>
    </div>
  );

  const [dirtyInstance, setDirtyInstance] =
    React.useState<InstanceOf<M> | null>(null);

  if (dirtyInstance) {
    return layout({
      crud_ctrls: edit_ui(model, dirtyInstance, setDirtyInstance),
      actions: (
        <React.Fragment>
          <button
            children="cancel"
            onClick={() => {
              setDirtyInstance(null);
            }}
          />
          <button
            children="save"
            onClick={() => {
              props.update(dirtyInstance);
              setDirtyInstance(null);
            }}
          />
        </React.Fragment>
      ),
    });
  }

  return layout({
    crud_ctrls: view_ui(model, props.instance),
    actions: (
      <button
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
        <button
          children="cancel"
          onClick={() => {
            props.cancel();
          }}
        />
        <button
          children="add"
          onClick={() => {
            props.save(dirtyInstance);
          }}
        />
      </div>
    </div>
  );
};

const AdminTable = <M extends ModelBase>(props: {
  model: M;
  instances: InstanceOf<M>[];
  onSelected: (instance: InstanceOf<M>) => void;
}): React.ReactElement => {
  const { model, instances } = props;
  const columns = Object.keys(model);

  return (
    <table>
      <thead>
        <tr>
          {columns.map((c) => (
            <th key={c} children={c} />
          ))}
        </tr>
      </thead>
      <tbody>
        {instances.map((instance) => {
          const ui = view_ui(model, instance);
          return (
            <tr onClick={() => props.onSelected(instance)} key={instance.id}>
              {columns.map((c) => (
                <td key={`${instance.id}/${c}`}>{ui[c]}</td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
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
            <button
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
          <button children="back" onClick={() => setSelectedUuid(null)} />
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

  return (
    <div>
      <h1>detool</h1>

      {body}
    </div>
  );
}
