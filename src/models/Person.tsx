import {
  UuidField,
  ShortText,
  EmailAddress,
  DateField,
  LongText,
  Optional,
  CrudUI,
} from "../api";
import { Row } from "../components";

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
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Row c={[person.firstName, person.lastName]} />
      <Row c={[person.email]} />
      <Row c={[person.bio]} />
      <Row c={[person.twitter, person.linkedin]} />
    </div>
  );
};
