import { InstanceOf, ModelBase } from "../detool-api/model";
import { view_ui } from "../detool-api/ui";
import { Table as FlowbiteTable } from "flowbite-react";

export const AdminTable = <M extends ModelBase>(props: {
  model: M;
  instances: InstanceOf<M>[];
  onSelected: (instance: InstanceOf<M>) => void;
}): React.ReactElement => {
  const { model, instances } = props;
  const columns = Object.keys(model) as (string & keyof M)[];

  return (
    <FlowbiteTable hoverable>
      <FlowbiteTable.Head>
        {columns.map((c) => (
          <FlowbiteTable.HeadCell key={c} children={c} />
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
              {columns.map((c: string & keyof M) => (
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
