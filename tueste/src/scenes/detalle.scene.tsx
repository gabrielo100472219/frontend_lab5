import { Link, useNavigate } from "@tanstack/react-router";
import { DetalleContainer } from "../pods/catalogo";

export function DetalleScene({ id }: { id: string }) {
  const navigate = useNavigate();

  async function onDeleted() {
    await navigate({ to: "/coffees" });
  }

  return (
    <>
      <p>
        <Link to="/coffees">← Volver al catálogo</Link>
      </p>
      <DetalleContainer key={id} id={id} onDeleted={onDeleted} />
    </>
  );
}
