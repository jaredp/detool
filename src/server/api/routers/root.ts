import { router } from "../trpc";
import { modelInstance } from "./model_instance";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = router({
  model_instance: modelInstance,
});

// export type definition of API
export type AppRouter = typeof appRouter;
