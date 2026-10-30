import { createRootRoute } from "@tanstack/react-router";
import { AppLayout } from "../layouts/app-layout";

export const Route = createRootRoute({
  component: AppLayout,
  notFoundComponent: () => <h1>Página no encontrada</h1>,
});
