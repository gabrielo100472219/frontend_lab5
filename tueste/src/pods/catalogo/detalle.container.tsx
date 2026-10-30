import { deleteCoffee } from "../../core/coffees/api";
import { useCoffee } from "../../core/coffees/hooks";
import { ErrorMessage, Loading } from "../../common/components/request-status";
import { DetalleComponent } from "./detalle.component";

interface Props {
  id: string;
  onDeleted: () => Promise<void>;
}

export function DetalleContainer({ id, onDeleted }: Props) {
  const { coffee, loading, error } = useCoffee(id);

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;
  if (!coffee) return <p>Café no encontrado</p>;
  return (
    <DetalleComponent
      coffee={coffee}
      onDelete={async () => {
        await deleteCoffee(coffee.id);
        await onDeleted();
      }}
    />
  );
}
