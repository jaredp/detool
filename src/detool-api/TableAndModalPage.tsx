import * as React from "react";
import { AdminTable } from "../components/AdminTable";
import { DefaultForm } from "./ui";
import { Button, Pagination, PaginationButtonProps } from "flowbite-react";
import { PlusIcon } from "@heroicons/react/24/solid";
import { Modal } from "../components/Modal";
import { Loading } from "../components/Loading";
import { NewInstancePage, EditableCrud } from "./GenericUI";
import { EnrichedModel } from "./model";
import clsx from "clsx";

const new_instance_symbol = Symbol("new instance");

const PAGE_SIZE = 5;

export function TableAndModalPage<M extends EnrichedModel>(props: {
  model: M;
}) {
  const [selectedUuid, setSelectedUuid] = React.useState<
    string | typeof new_instance_symbol | null
  >(null);
  const [page, setPage] = React.useState<number>(1);
  const [sort, setSort] = React.useState<[string, "asc" | "desc"] | null>(null);

  const countHook = props.model.hooks.count.useQuery();

  const result = props.model.hooks.list.useQuery({
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
    orderBy: sort ? [sort] : undefined,
  });
  const createHook = props.model.hooks.create.useMutation();
  const updateHook = props.model.hooks.update.useMutation();
  const deleteHook = props.model.hooks.delete.useMutation();

  if (!result.data || !countHook.data) {
    return <Loading />;
  }
  const instanceCount = countHook.data;
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

  const totalPages = Math.ceil(instanceCount / PAGE_SIZE);
  const paginator =
    totalPages > 1 ? (
      <div className="flex items-center justify-center text-center">
        <Pagination
          currentPage={1}
          onPageChange={(page) => setPage(page)}
          showIcons={true}
          totalPages={totalPages}
          renderPaginationButton={(props: PaginationButtonProps) => (
            <button
              className={clsx(
                props.active ? "bg-blue-500 text-white" : "bg-white",
                `rounded border border-blue-500 px-4 py-2 font-semibold text-blue-500 hover:bg-blue-100`
              )}
              {...props}
            />
          )}
        />
      </div>
    ) : null;
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end">
        <span className="flex-grow text-sm text-gray-500">
          {instanceCount} total rows loaded
          <br />
          Click on a row edit to edit it
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
        sort={sort}
        onSelected={(instance) => setSelectedUuid(instance.id)}
        onColumnSelected={(column) => {
          if (sort && sort[0] === column) {
            if (sort[1] === null) {
              setSort([column, "asc"]);
            } else if (sort[1] === "asc") {
              setSort([column, "desc"]);
            } else if (sort[1] === "desc") {
              setSort(null);
            }
          } else {
            setSort([column, "asc"]);
          }
        }}
      />
      {paginator}

      {new_modal}
      {detail_modal}
    </div>
  );
}
