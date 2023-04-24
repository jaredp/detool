import { Row } from "../components/Row";
import {
  UuidField,
  ShortText,
  EmailAddress,
  DateField,
  LongText,
  Optional,
  UrlField,
} from "../detool-api/field";
import { Model, CrudUI } from "../detool-api/model";

export const Person = Model({
  id: UuidField,
  firstName: ShortText,
  lastName: ShortText,
  email: EmailAddress,
  birthday: DateField,
  bio: LongText,

  twitter: Optional(UrlField),
  linkedin: Optional(UrlField),
});

/// server and client
// Person.list()
// Person.create({ ... })
// Person.get(id)
// Person.update(id, { ... })
// Person.delete(id)

export const PersonForm: React.FC<{
  instance: CrudUI<typeof Person>;
}> = ({ instance }) => {
  return (
    <div className="flex flex-col gap-4">
      <Row c={[instance.firstName, instance.lastName]} />
      <Row c={[instance.email, instance.birthday]} />
      <Row c={[instance.bio]} />
      <Row c={[instance.twitter, instance.linkedin]} />
    </div>
  );
};
