import { Company } from "../../../models/Company";
import { Person } from "../../../models/Person";
import { router } from "../trpc";
import { allDetoolTrpcCrudRoutes } from "../../../detool-api/trpc_api";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = router({
  detool_crud: allDetoolTrpcCrudRoutes([Person, Company]),
});

// export type definition of API
export type AppRouter = typeof appRouter;
