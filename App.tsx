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
          style={{ flex: 1, /*border: '1px solid #DDD',*/ padding: '1em 0' }}
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
  return _.mapValues(model, (field) => field.dummy_value());
}

function view_ui<M extends ModelBase>(
  model: M,
  instance: InstanceOf<M>
): CrudUI<M> {
  return _.mapValues(model, (field, name) => field.view(instance[name]));
}

function edit_ui<M extends ModelBase>(
  model: M,
  instance: InstanceOf<M>,
  update: (newInstance: InstanceOf<M>) => void
): CrudUI<M> {
  return _.mapValues(model, (field, name) =>
    field.edit(instance[name], (newValue) =>
      update({ ...instance, [name]: newValue })
    )
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

const PersonDetail: React.FC<{
  instance: CrudUI<typeof Person>;
}> = (props) => {
  const person = props.instance;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Row c={[person.firstName, person.lastName]} />
      <Row c={[person.email]} />
      <Row c={[person.bio]} />
    </div>
  );
};

const DetailPage: React.FC<{
  instance: InstanceOf<typeof Person>;
  update: (newInstance: InstanceOf<typeof Person>) => void;
}> = (props) => {
  const [dirtyInstance, setDirtyInstance] = React.useState<InstanceOf<
    typeof Person
  > | null>(null);
  const person: CrudUI<typeof Person> =
    dirtyInstance === null
      ? view_ui(Person, props.instance)
      : edit_ui(Person, dirtyInstance, setDirtyInstance);

  return (
    <div>
      <PersonDetail instance={person} />
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        {dirtyInstance === null ? (
          <React.Fragment>
            <button
              children="edit"
              onClick={() => {
                setDirtyInstance(props.instance);
              }}
            />
          </React.Fragment>
        ) : (
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
        )}
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

export default function App() {
  const [people, setPeople] = React.useState(
    (_.range(100) as number[]).map((_i) => dummy_instance(Person))
  );

  const [selectedUuid, setSelectedUuid] = React.useState<string | null>(null);
  const selected = people.find((p) => p.id === selectedUuid);

  const body = !selected ? (
    <div>
      <p>Click any rows below to edit them</p>
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
      <DetailPage
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
