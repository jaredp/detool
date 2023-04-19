import { ModelBase, InstanceOf } from "../api";
import { view_ui } from "../ui";
import { Table as FlowbiteTable } from "flowbite-react";

export const AdminTable = <M extends ModelBase>(props: {
  model: M;
  instances: InstanceOf<M>[];
  onSelected: (instance: InstanceOf<M>) => void;
}): React.ReactElement => {
  const { model, instances } = props;
  const columns = Object.keys(model);

  return (
    <FlowbiteTable hoverable>
      <FlowbiteTable.Head>
        {columns.map((c) => (
          <FlowbiteTable.HeadCell key={c} children={c} />
        ))}
      </FlowbiteTable.Head>
      <FlowbiteTable.Body className="divide-y">
        {instances.map((instance) => {
          const ui = view_ui(model, instance);
          return (
            <FlowbiteTable.Row
              onClick={() => props.onSelected(instance)}
              key={instance.id}
            >
              {columns.map((c) => (
                <FlowbiteTable.Cell
                  key={`${instance.id}/${c}`}
                  className="whitespace-nowrap max-w-md overflow-hidden overflow-ellipsis"
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
