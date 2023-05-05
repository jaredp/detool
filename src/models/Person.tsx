import { Row } from "../components/Row";
import {
  ShortText,
  EmailAddress,
  DateField,
  LongText,
  Optional,
  UrlField,
} from "../detool-api/field";
import { Model, CrudUI } from "../detool-api/model";

export const Person = Model("Person", {
  firstName: ShortText,
  lastName: ShortText,
  email: EmailAddress,
  birthday: DateField,
  bio: LongText,

  twitter: Optional(UrlField),
  linkedin: Optional(UrlField),
}, {
  DefaultForm: ({ instance }) => (
    <div className="flex flex-col gap-4">
      <Row c={[instance.firstName, instance.lastName]} />
      <Row c={[instance.email, instance.birthday]} />
      <Row c={[instance.bio]} />
      <Row c={[instance.twitter, instance.linkedin]} />
    </div>
  )
});
