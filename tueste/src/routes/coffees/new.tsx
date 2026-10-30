import { createFileRoute } from "@tanstack/react-router";
import { EdicionScene } from "../../scenes/edicion.scene";

export const Route = createFileRoute("/coffees/new")({
  component: () => <EdicionScene />,
});
