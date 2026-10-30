import { saveCoffee } from "../../core/coffees/api";
import { useCoffee } from "../../core/coffees/hooks";
import type { CoffeeInput } from "../../core/coffees/model";
import { ErrorMessage, Loading } from "../../common/components/request-status";
import { EdicionComponent } from "./edicion.component";

type OnSaved = (id: number) => Promise<void>;

export function AltaContainer({ onSaved }: { onSaved: OnSaved }) {
  return (
    <EdicionComponent
      onSave={async (values) => {
        const saved = await saveCoffee(values);
        await onSaved(saved.id);
      }}
    />
  );
}

export function EdicionContainer({
  id,
  onSaved,
}: {
  id: string;
  onSaved: OnSaved;
}) {
  const { coffee, loading, error } = useCoffee(id);

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;
  if (!coffee) return <p>Café no encontrado</p>;

  const initialValues: CoffeeInput = {
    name: coffee.name,
    origin: coffee.origin,
    roast: coffee.roast,
    price: coffee.price,
    notes: coffee.notes,
  };

  return (
    <EdicionComponent
      initialValues={initialValues}
      onSave={async (values) => {
        const saved = await saveCoffee(values, coffee.id);
        await onSaved(saved.id);
      }}
    />
  );
}
