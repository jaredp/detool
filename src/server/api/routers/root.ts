import { Company } from "../../../models/Company";
import { Person } from "../../../models/Person";
import { router } from "../trpc";
import { crudAPI } from "../../../detool-api/trpc_api";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = router({
  model_instance: crudAPI(Person),
  company: crudAPI(Company),
});

// export type definition of API
export type AppRouter = typeof appRouter;
