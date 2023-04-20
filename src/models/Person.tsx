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
