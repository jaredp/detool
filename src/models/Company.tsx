import { ShortText, UrlField } from "../detool-api/field";
import { Model } from "../detool-api/model";

export const Company = Model("Company", {
  name: ShortText,
  website: UrlField,
});
