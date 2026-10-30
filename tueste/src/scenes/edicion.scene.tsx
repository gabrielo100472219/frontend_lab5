import { Link, useNavigate } from "@tanstack/react-router";
import { AltaContainer, EdicionContainer } from "../pods/edicion";

export function EdicionScene({ id }: { id?: string }) {
  const navigate = useNavigate();

  async function onSaved(coffeeId: number) {
    await navigate({
      to: "/coffees/$coffeeId",
      params: { coffeeId: String(coffeeId) },
    });
  }

  return (
    <>
      <header className="space-y-2">
        <h1>{id ? "Editar café" : "Añadir café"}</h1>
        {id ? (
          <Link to="/coffees/$coffeeId" params={{ coffeeId: id }}>
            Cancelar y volver al detalle
          </Link>
        ) : (
          <Link to="/coffees">Cancelar y volver al catálogo</Link>
        )}
      </header>
      {id ? (
        <EdicionContainer key={id} id={id} onSaved={onSaved} />
      ) : (
        <AltaContainer onSaved={onSaved} />
      )}
    </>
  );
}
