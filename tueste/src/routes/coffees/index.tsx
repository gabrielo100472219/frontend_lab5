import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { coffeeSchema } from "../../core/coffees/coffee.schema";
import { CatalogoScene } from "../../scenes/catalogo.scene";

// Un parámetro inválido (?roast=azul) se descarta en lugar de romper la página.
const searchSchema = z.object({
  q: z.string().optional().catch(undefined),
  roast: coffeeSchema.shape.roast.optional().catch(undefined),
});

export const Route = createFileRoute("/coffees/")({
  validateSearch: searchSchema,
  component: CatalogoPage,
});

function CatalogoPage() {
  const filters = Route.useSearch();
  return <CatalogoScene filters={filters} />;
}
