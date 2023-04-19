import {
  UuidField,
  ShortText,
  EmailAddress,
  DateField,
  LongText,
  Optional,
  CrudUI,
} from "../api";
import { Row } from "../components/Row";

export const Person = {
  id: UuidField,
  firstName: ShortText,
  lastName: ShortText,
  email: EmailAddress,
  birthday: DateField,
  bio: LongText,

  twitter: Optional(URL),
  linkedin: Optional(URL),
};

export const PersonForm: React.FC<{
  person: CrudUI<typeof Person>;
}> = (props) => {
  const { person } = props;
  return (
    <div className="flex flex-col gap-4">
      <Row c={[person.firstName, person.lastName]} />
      <Row c={[person.email, person.birthday]} />
      <Row c={[person.bio]} />
      <Row c={[person.twitter, person.linkedin]} />
    </div>
  );
};
