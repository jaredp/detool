import * as React from "react";
import { AdminTable } from "../components/AdminTable";
import { DefaultForm } from "./ui";
import { Button } from "flowbite-react";
import { PlusIcon } from "@heroicons/react/24/solid";
import { Modal } from "../components/Modal";
import { Loading } from "../components/Loading";
import { NewInstancePage, EditableCrud } from "./GenericUI";
import { ModelBase } from "./model";
import { CrudApiHooks } from "./trpc_api";

const new_instance_symbol = Symbol("new instance");

export function TableAndModalPage<M extends ModelBase>(props: {
  model: M,
  crud_api: CrudApiHooks<M>
}) {
  const [selectedUuid, setSelectedUuid] = React.useState<
    string | typeof new_instance_symbol | null
  >(null);
  const result = props.crud_api.list.useQuery();
  const createHook = props.crud_api.create.useMutation();
  const updateHook = props.crud_api.update.useMutation();
  const deleteHook = props.crud_api.delete.useMutation();

  if (!result.data) {
    return <Loading />;
  }

  const instances = result.data;
  const selected = instances.find((p) => p.id === selectedUuid);

  const new_modal = !(selectedUuid === new_instance_symbol) ? null : (
    <Modal show={true} onClose={() => setSelectedUuid(null)}>
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
    </Modal>
  );

  const detail_modal = !selected ? null : (
    <Modal show={true} onClose={() => setSelectedUuid(null)}>
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
    </Modal>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <span className="flex-grow text-sm text-gray-500 ">
          {instances.length} instances loaded. <br />
          Click any rows below to edit them
        </span>
        <Button
          color="success"
          size={"xs"}
          onClick={() => setSelectedUuid(new_instance_symbol)}
        >
          {"Add"}
          <PlusIcon className="ml-2 h-4 w-4" />
        </Button>
      </div>
      <AdminTable
        model={props.model}
        instances={instances}
        onSelected={(instance) => setSelectedUuid(instance.id)}
      />

      {new_modal}
      {detail_modal}
    </div>
  );
}