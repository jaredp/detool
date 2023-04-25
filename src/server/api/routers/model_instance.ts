import { Person } from "./../../../models/Person";
import { z } from "zod";

import { router, publicProcedure } from "../trpc";
import { InstanceOf } from "../../../detool-api/model";
import { ModelStore } from "../../stores/api";

const getModelStore: () => ModelStore<typeof Person> = () =>
  (Person as any).__serverApi;

export const modelInstance = router({
  list: publicProcedure.query(() => {
    return getModelStore().list();
  }),
  create: publicProcedure
    .input(
      z
        .object({
          data: z.custom<InstanceOf<typeof Person>>(),
        })
        .required()
    )
    .mutation(async ({ input }) => {
      return getModelStore().create(input.data);
    }),
  getById: publicProcedure
    .input(
      z
        .object({
          id: z.string(),
        })
        .required()
    )
    .query(async ({ input }) => {
      return getModelStore().getById(input.id);
    }),
  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        data: z.custom<InstanceOf<typeof Person>>(),
      })
    )
    .mutation(async ({ input }) => {
      return getModelStore().update(input.id, input.data);
    }),
  delete: publicProcedure
    .input(
      z
        .object({
          id: z.string(),
        })
        .required()
    )
    .mutation(async ({ input }) => {
      return getModelStore().delete(input.id);
    }),
});
