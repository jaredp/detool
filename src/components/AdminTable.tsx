import { InstanceOf, ModelBase } from "../detool-api/model";
import { humanize_label } from "../detool-api/name_utils";
import { view_ui } from "../detool-api/ui";
import { Table as FlowbiteTable } from "flowbite-react";
import {
  ArrowSmallDownIcon,
  ArrowSmallUpIcon,
} from "@heroicons/react/24/solid";

export const AdminTable = <M extends ModelBase>(props: {
  model: M;
  instances: InstanceOf<M>[];
  sort?: [string, "asc" | "desc"] | null;
  onSelected: (instance: InstanceOf<M>) => void;
  onColumnSelected: (column: keyof M["fields"] & string) => void;
}): React.ReactElement => {
  const { model, instances } = props;
  const columns = Object.keys(model.fields) as (string & keyof M["fields"])[];

  return (
    <FlowbiteTable hoverable className="text-gray-900">
      <FlowbiteTable.Head>
        {columns.map((c) => (
          <FlowbiteTable.HeadCell
            key={c}
            onClick={() => props.onColumnSelected(c)}
            className="cursor-pointer select-none"
          >
            {humanize_label(c)}
            {props.sort?.[0] === c ? (
              props.sort[1] === "asc" ? (
                <ArrowSmallUpIcon className="inline-block h-4 w-4" />
              ) : (
                <ArrowSmallDownIcon className="inline-block h-4 w-4" />
              )
            ) : null}
          </FlowbiteTable.HeadCell>
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
