import { Row } from "../components/Row";
import {
  Checkbox,
  DateField,
  LongText,
  ShortText,
  UrlField,
} from "../detool-api/field";
import { Model } from "../detool-api/model";

export const Post = Model(
  "Post",
  {
    title: ShortText,
    link: UrlField,
    body: LongText,
    posted_at: DateField,
    is_published: Checkbox,
  },
  {
    DefaultForm: ({ instance }) => (
      <div className="flex flex-col gap-4">
        <Row c={[instance.title]} />
        <Row c={[instance.link, instance.posted_at, instance.is_published]} />
        {instance.body}
      </div>
    ),
  }
);
