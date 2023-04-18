import * as React from 'react';
import './style.css';
import { faker } from '@faker-js/faker';
import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';

const Row: React.FC<{ c: React.ReactNode[] }> = (props) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'row', gap: 16 }}>
      {props.c.map((child, i) => (
        <div
          key={i}
          style={{ flex: 1, /*border: '1px solid #DDD',*/ padding: '1em' }}
          children={child}
        />
      ))}
    </div>
  );
};

/* 

Model defined in high level types that know thier
1. representation (string, int, etc)
2. validation (email address, phone number, etc)
3. default view and edit controls (plain text, <input type="text" />, <input type="email" />)
4. fake values (faker.js)

*/

interface ModelBase {
  id: typeof UuidField;
}

interface Field<T> {
  dummy_value: () => T;
  view: (T) => React.ReactNode;
  edit: (val: T, update: (newValue: T) => void) => React.ReactNode;
}

type FieldType<T> = T extends Field<infer X> ? X : never;
type InstanceOf<T> = { [Property in keyof T]: FieldType<T[Property]> };
type CrudUI<T> = { [Property in keyof T]: React.ReactNode };

function dummy_instance<M extends ModelBase>(model: M): InstanceOf<M> {
  return _.fromPairs(_.toPairs(model).map(([k, v]) => [k, v.dummy_value()]));
}

function view_ui<M extends ModelBase>(
  model: M,
  instance: InstanceOf<M>
): CrudUI<M> {
  return _.fromPairs(
    _.toPairs(model).map(([k, v]) => [k, v.view(instance[k])])
  );
}

function edit_ui<M extends ModelBase>(
  model: M,
  instance: InstanceOf<M>,
  update: (newInstance: InstanceOf<M>) => void
): CrudUI<M> {
  return _.fromPairs(
    _.toPairs(model).map(([k, v]) => [
      k,
      v.edit(instance[k], (newValue) => update({ ...instance, [k]: newValue })),
    ])
  );
}

const UuidField: Field<string> = {
  dummy_value: () => uuidv4(),
  view: (val) => val,
  edit: (val, _update) => <input type="input" readOnly disabled value={val} />,
};

const DateField: Field<Date> = {
  dummy_value: () => new Date(),
  view: (val) => val.toString(),
  edit: (val, update) => (
    <input
      type="date"
      value={val.toISOString().slice(0, 10)}
      onChange={(e) => update(new Date(e.target.value))}
    />
  ),
};

const ShortText: Field<string> = {
  dummy_value: () => faker.lorem.words(),
  view: (val) => val,
  edit: (val, update) => (
    <input
      type="text"
      value={val}
      onChange={(e) => update(e.target.value)}
      style={{ width: '100%' }}
    />
  ),
};

const EmailAddress: Field<string> = {
  dummy_value: () => faker.internet.email(),
  view: (val) => val,
  edit: (val, update) => (
    <input
      type="email"
      value={val}
      onChange={(e) => update(e.target.value)}
      style={{ width: '100%' }}
    />
  ),
};

const LongText: Field<string> = {
  dummy_value: () => faker.lorem.paragraph(),
  view: (val) => val,
  edit: (val, update) => (
    <textarea
      value={val}
      onChange={(e) => update(e.target.value)}
      style={{ width: '100%' }}
    />
  ),
};

const Optional = (_ignore: any) => ShortText;

const Person = {
  id: UuidField,
  firstName: ShortText,
  lastName: ShortText,
  email: EmailAddress,
  birthday: DateField,
  bio: LongText,

  twitter: Optional(URL),
  linkedin: Optional(URL),
};

const PersonForm: React.FC<{
  instance: InstanceOf<typeof Person>;
  update: (newInstance: InstanceOf<typeof Person>) => void;
  mode: 'read' | 'edit' | 'create';
}> = (props) => {
  const { mode } = props;
  const [instance, setInstance] = React.useState(props.instance);
  const person: CrudUI<typeof Person> =
    mode === 'read'
      ? view_ui(Person, instance)
      : edit_ui(
          Person,
          instance,
          (newInstance) => void setInstance(newInstance)
        );
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Row c={[person.firstName, person.lastName]} />
      <Row c={[person.email]} />
      <Row c={[person.bio]} />

      {mode !== 'read' ? (
        <Row
          c={[
            <button
              children="save"
              onClick={() => void props.update(instance)}
            />,
          ]}
        />
      ) : null}
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
        {columns.map((c) => (
          <th children={c} />
        ))}
      </thead>
      <tbody>
        {instances.map((instance) => {
          const ui = view_ui(model, instance);
          return (
            <tr onClick={() => props.onSelected(instance)}>
              {columns.map((c) => (
                <td>{ui[c]}</td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

const DetailPage: React.FC<{
  instance: InstanceOf<typeof Person>;
  update: (newInstance: InstanceOf<typeof Person>) => void;
}> = (props) => {
  const [edit, setEdit] = React.useState(false);
  return (
    <div>
      <h1>Hello StackBlitz!</h1>
      <p>Start editing to see some magic happen :)</p>

      <PersonForm
        instance={props.instance}
        mode={edit ? 'edit' : 'read'}
        update={props.update}
      />
      {edit ? (
        <button children="done" onClick={() => setEdit(false)} />
      ) : (
        <button children="edit" onClick={() => setEdit(true)} />
      )}
    </div>
  );
};

export default function App() {
  const [localState, setLocalState] = React.useState(
    _.range(100).map((_i) => dummy_instance(Person))
  );
  const [selected, setSelected] = React.useState<InstanceOf<
    typeof Person
  > | null>(null);

  const body =
    selected === null ? (
      <AdminTable
        model={Person}
        instances={localState}
        onSelected={(person) => setSelected(person)}
      />
    ) : (
      <div>
        <div>
          <button children="back" onClick={() => setSelected(null)} />
        </div>
        <DetailPage
          instance={selected}
          update={(newInstance) => {
            const newLocalState = [];
            for (const instance of localState) {
              newLocalState.push(
                instance.id === newInstance.id ? newInstance : instance
              );
            }
            setLocalState(newLocalState);
            setSelected(null);
          }}
        />
      </div>
    );

  return <div>{body}</div>;
}
