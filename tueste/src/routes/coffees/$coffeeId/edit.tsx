import { createFileRoute } from "@tanstack/react-router";
import { EdicionScene } from "../../../scenes/edicion.scene";

export const Route = createFileRoute("/coffees/$coffeeId/edit")({
  component: EditPage,
});

function EditPage() {
  const { coffeeId } = Route.useParams();
  return <EdicionScene id={coffeeId} />;
}
