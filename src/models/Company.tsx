import { Row } from "../components/Row";
import { ShortText, UrlField } from "../detool-api/field";
import { Model, CrudUI } from "../detool-api/model";

export const Company = Model("Company", {
  name: ShortText,
  website: UrlField,
});

export const CompanyForm: React.FC<{
  instance: CrudUI<typeof Company>;
}> = ({ instance }) => {
  return (
    <div className="flex flex-col gap-4">
      <Row c={[instance.name]} />
      <Row c={[instance.website]} />
    </div>
  );
};
