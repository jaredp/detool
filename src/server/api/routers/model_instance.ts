import { Person } from "./../../../models/Person";
import { z } from "zod";

import { router, publicProcedure } from "../trpc";
import { InMemoryModelStore } from "../../stores/in_memory";
import { InMemoryServer } from "../../db";
import { InstanceOf } from "../../../api";

const server = InMemoryServer.instance;
const personModelStore = server.getModelStore("Person") as InMemoryModelStore<
  typeof Person
>;

export const modelInstance = router({
  list: publicProcedure.query(() => {
    return personModelStore.list();
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
      return personModelStore.create(input.data);
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
      return personModelStore.getById(input.id);
    }),
  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        data: z.custom<InstanceOf<typeof Person>>(),
      })
    )
    .mutation(async ({ input }) => {
      return personModelStore.update(input.id, input.data);
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
      return personModelStore.delete(input.id);
    }),
});
