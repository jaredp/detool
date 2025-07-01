import { Row } from "../components/Row";
import {
  Checkbox,
  DateField,
  LongText,
  ShortText,
  UrlField,
  ComputedString,
  ComputedNumber,
  ComputedBoolean,
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

    // Computed fields
    wordCount: ComputedNumber(
      (instance: any) => {
        if (!instance.body) return 0;
        return instance.body.trim().split(/\s+/).filter((word: string) => word.length > 0).length;
      }
    ),

    status: ComputedString(
      (instance: any) => {
        if (instance.is_published) {
          return "Published";
        } else {
          return "Draft";
        }
      }
    ),

    isRecent: ComputedBoolean(
      (instance: any) => {
        if (!instance.posted_at) return false;
        const postDate = new Date(instance.posted_at);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return postDate > weekAgo;
      }
    ),
  },
  {
    DefaultForm: ({ instance }) => (
      <div className="flex flex-col gap-4">
        <Row c={[instance.title, instance.status]} />
        <Row c={[instance.link, instance.posted_at, instance.is_published]} />
        <Row c={[instance.wordCount, instance.isRecent]} />
        {instance.body}
      </div>
    ),
  }
);
