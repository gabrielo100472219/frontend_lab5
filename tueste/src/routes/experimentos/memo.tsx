import { createFileRoute } from "@tanstack/react-router";
import { MemoLab } from "../../experiments/memo-lab";

export const Route = createFileRoute("/experimentos/memo")({
  component: MemoLab,
});
