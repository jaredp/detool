import { z } from "zod";

import { router, publicProcedure } from "../server/api/trpc";
import { InstanceOf, ModelBase } from "./model";
import { ModelStore } from "../server/stores/api";

const getStoreForModel = <M extends ModelBase,>(model: M): ModelStore<M> =>
  (model as any).__serverApi;

export function crudAPI<M extends ModelBase>(model: M) {
  const store = getStoreForModel(model);
  return router({
    list: publicProcedure.query(() => {
      return store.list();
    }),
    create: publicProcedure
      .input(
        z
          .strictObject({
            // FIXME: this needs to do runtime type validation
            data: z.custom<InstanceOf<M>>(),
          })
          .required()
      )
      .mutation(async ({ input }) => {
        // FIXME: what's going on with these types that it thinks there can be undefined?
        return store.create(input!.data!);
      }),
    getById: publicProcedure
      .input(
        z
          .strictObject({
            id: z.string(),
          })
          .required()
      )
      .query(async ({ input }) => {
        return store.getById(input.id);
      }),
    update: publicProcedure
      .input(
        z.strictObject({
          id: z.string(),
          // FIXME: this needs to do runtime type validation
          data: z.custom<InstanceOf<M>>(),
        })
        .required()
      )
      .mutation(async ({ input }) => {
        // FIXME: what's going on with these types that it thinks there can be undefined?
        return store.update(input!.id, input!.data!);
      }),
    delete: publicProcedure
      .input(
        z
          .strictObject({
            id: z.string(),
          })
          .required()
      )
      .mutation(async ({ input }) => {
        return store.delete(input.id);
      }),
  });
}
