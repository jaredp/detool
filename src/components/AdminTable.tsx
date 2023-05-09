import { InstanceOf, ModelBase } from "../detool-api/model";
import { humanize_label } from "../detool-api/name_utils";
import { view_ui } from "../detool-api/ui";
import { Table as FlowbiteTable } from "flowbite-react";

export const AdminTable = <M extends ModelBase>(props: {
  model: M;
  instances: InstanceOf<M>[];
  onSelected: (instance: InstanceOf<M>) => void;
}): React.ReactElement => {
  const { model, instances } = props;
  const columns = Object.keys(model.fields) as (string & keyof M["fields"])[];

  return (
    <FlowbiteTable hoverable className="text-gray-900">
      <FlowbiteTable.Head>
        {columns.map((c) => (
          <FlowbiteTable.HeadCell key={c} children={humanize_label(c)} />
        ))}
      </FlowbiteTable.Head>
      <FlowbiteTable.Body className="divide-y">
        {instances.map((instance) => {
          const ui = view_ui(model, instance, {
            className: "w-full flex-grow",
          });
          return (
            <FlowbiteTable.Row
              onClick={() => props.onSelected(instance)}
              key={instance.id}
            >
              {columns.map((c: keyof M["fields"]) => (
                <FlowbiteTable.Cell
                  key={`${instance.id}/${String(c)}`}
                  className="max-w-md overflow-hidden overflow-ellipsis whitespace-nowrap"
                >
                  {ui[c]}
                </FlowbiteTable.Cell>
              ))}
            </FlowbiteTable.Row>
          );
        })}
      </FlowbiteTable.Body>
    </FlowbiteTable>
  );
};
