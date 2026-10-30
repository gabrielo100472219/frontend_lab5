import { createFileRoute } from "@tanstack/react-router";
import { DetalleScene } from "../../../scenes/detalle.scene";

export const Route = createFileRoute("/coffees/$coffeeId/")({
  component: DetailPage,
});

function DetailPage() {
  const { coffeeId } = Route.useParams();
  return <DetalleScene id={coffeeId} />;
}
