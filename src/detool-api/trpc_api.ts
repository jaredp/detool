import { z } from "zod";

import { router, publicProcedure } from "../server/api/trpc";
import { ModelBase, InstanceOf } from "./model";
import { getApiForModel } from "./state";
import type { createTRPCNext } from "@trpc/next";

export function crudAPI<M extends ModelBase>(model: M) {
  const store = getApiForModel(model);
  return router({
    list: publicProcedure
      .input(
        z
          .object({
            limit: z.number().optional(),
            offset: z.number().optional(),
            orderBy: z
              .array(
                z.tuple([
                  z.custom(
                    (v) =>
                      typeof v === "string" &&
                      Object.keys(model.fields).includes(v)
                  ),
                  z.enum(["asc", "desc"]),
                ])
              )
              .optional(),
            where: z
              .array(
                z.tuple([
                  z.custom(
                    (v) =>
                      typeof v === "string" &&
                      Object.keys(model.fields).includes(v)
                  ),
                  z.enum(["eq", "ne", "gt", "lt", "gte", "lte", "like"]),
                  z.any(),
                ])
              )
              .optional(),
          })
          .optional()
      )
      .query(({ input }) => {
        return store.list(input);
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
        z
          .strictObject({
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

export type CrudApiHooks<M extends ModelBase> = ReturnType<
  typeof createTRPCNext<ReturnType<typeof crudAPI<M>>>
>;

export function allDetoolTrpcCrudRoutes(models: ModelBase[]) {
  return router({
    ...Object.fromEntries(
      models.map((model) => [model.routename, crudAPI(model)])
    ),
  });
}
