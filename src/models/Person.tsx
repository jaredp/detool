import { Row } from "../components/Row";
import {
  ShortText,
  EmailAddress,
  DateField,
  LongText,
  Optional,
  UrlField,
  ComputedString,
  ComputedNumber,
} from "../detool-api/field";
import { Model } from "../detool-api/model";

export const Person = Model("Person", {
  firstName: ShortText,
  lastName: ShortText,
  email: EmailAddress,
  birthday: DateField,
  bio: LongText,

  twitter: Optional(UrlField),
  linkedin: Optional(UrlField),

  // Computed fields
  fullName: ComputedString(
    (instance: any) => `${instance.firstName || ""} ${instance.lastName || ""}`.trim()
  ),
  
  age: ComputedNumber(
    (instance: any) => {
      if (!instance.birthday) return 0;
      const today = new Date();
      const birthDate = new Date(instance.birthday);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    }
  ),
}, {
  DefaultForm: ({ instance }) => (
    <div className="flex flex-col gap-4">
      <Row c={[instance.fullName]} />
      <Row c={[instance.firstName, instance.lastName]} />
      <Row c={[instance.email, instance.birthday, instance.age]} />
      <Row c={[instance.bio]} />
      <Row c={[instance.twitter, instance.linkedin]} />
    </div>
  )
});
