import * as React from "react";
import { DefaultForm } from "./ui";
import { Avatar, Button } from "flowbite-react";
import { ChevronRightIcon, PlusIcon } from "@heroicons/react/24/solid";
import { Loading } from "../components/Loading";
import { NewInstancePage, EditableCrud } from "./GenericUI";
import { EnrichedModel } from "./model";
import clsx from "clsx";

const new_instance_symbol = Symbol("new instance");

const ListItem = (props: {
  instance: any;
  onClick: () => void;
  active?: boolean;
}) => {
  const { instance, onClick } = props;
  const keys = Object.keys(instance).filter((k) => k !== "id");
  const headingKey = keys[0];
  const subheadingKey = keys[1];
  const heading = headingKey ? (instance as any)[headingKey] : undefined;
  const subheading = subheadingKey
    ? (instance as any)[subheadingKey]
    : undefined;
  return (
    <li
      key={instance.id}
      className={clsx("cursor-pointer select-none p-4 hover:bg-slate-50", {
        "bg-slate-50": props.active,
      })}
      onClick={() => onClick()}
    >
      <div className="flex items-center space-x-4">
        <Avatar
          className="shrink-0"
          rounded={true}
          placeholderInitials={heading ? heading[0].toUpperCase() : undefined}
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
            {heading}
          </p>
          <p className="truncate text-sm text-gray-500 dark:text-gray-400">
            {subheading}
          </p>
        </div>
        <ChevronRightIcon className="inline-flex h-4 w-4 items-center" />
      </div>
    </li>
  );
};

export function ListDetailPage<M extends EnrichedModel>(props: { model: M }) {
  const [selectedUuid, setSelectedUuid] = React.useState<
    string | typeof new_instance_symbol | null
  >(null);

  const result = props.model.hooks.list.useQuery({
    orderBy: [["id", "asc"]],
  });
  const createHook = props.model.hooks.create.useMutation();
  const updateHook = props.model.hooks.update.useMutation();
  const deleteHook = props.model.hooks.delete.useMutation();

  if (!result.data) {
    return <Loading />;
  }

  const instances = result.data;
  const selected = instances.find((p) => p.id === selectedUuid);

  const new_modal = !(selectedUuid === new_instance_symbol) ? null : (
    <NewInstancePage
      model={props.model}
      detail_view={(p) => <DefaultForm model={props.model} instance={p} />}
      cancel={() => setSelectedUuid(null)}
      save={async (new_instance) => {
        await createHook.mutateAsync({
          data: new_instance,
        });
        setSelectedUuid(null);
        result.refetch();
      }}
    />
  );

  const detail_modal = !selected ? null : (
    <>
      <EditableCrud
        model={props.model}
        detail_view={(p) => <DefaultForm model={props.model} instance={p} />}
        instance={selected}
        update={async (updated_instance) => {
          await updateHook.mutateAsync({
            id: updated_instance.id,
            data: updated_instance,
          });
          setSelectedUuid(null);
          result.refetch();
        }}
        delete={async () => {
          await deleteHook.mutateAsync({
            id: selected.id,
          });
          result.refetch();
          setSelectedUuid(null);
        }}
      />
    </>
  );

  return (
    <div className="flex h-full flex-1">
      <div className="max-w-xs overflow-y-auto border-r">
        <div className="flex items-center justify-end border-b p-2">
          <div className="flex-grow pl-2">
            <div className="text-md font-semibold text-gray-800">
              {props.model.name}
            </div>
            <div className="text-sm text-gray-500">
              {instances.length} total in the system
            </div>
          </div>
          <Button
            color="success"
            size={"xs"}
            onClick={() => setSelectedUuid(new_instance_symbol)}
          >
            {"Add"}
            <PlusIcon className="ml-2 h-4 w-4" />
          </Button>
        </div>
        <ul className="divide-y divide-gray-200 dark:divide-gray-700 ">
          {instances.map((instance) => (
            <ListItem
              key={instance.id}
              instance={instance}
              active={selectedUuid === instance.id}
              onClick={() => setSelectedUuid(instance.id)}
            />
          ))}
        </ul>
      </div>
      <div className="align-center flex flex-1 flex-col overflow-y-auto p-10">
        {new_modal || detail_modal || (
          <div className="flex h-full items-center justify-center">
            <p className="select-none text-center">
              <span className="text-lg text-gray-800">
                Select a {props.model.name} from the list
              </span>
              <br />
              <span className="text-md text-gray-500">
                on the left to view details
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
