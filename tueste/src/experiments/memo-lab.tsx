import { useMemo, useState } from "react";
import type { Coffee, Roast } from "../core/coffees/model";

// Catálogo de prueba: 2.000 cafés generados, sólo para medir.
const origins = ["Etiopía", "Colombia", "Kenia", "Brasil", "Guatemala"];
const roasts: Roast[] = ["light", "medium", "dark"];
const bigCatalog: Coffee[] = Array.from({ length: 2000 }, (_, index) => ({
  id: index + 1,
  name: `${origins[index % origins.length]} lote ${index + 1}`,
  origin: origins[index % origins.length],
  roast: roasts[index % roasts.length],
  price: 10 + (index % 50) / 10,
  notes: "",
}));

const matches = (coffee: Coffee, filter: string) =>
  coffee.name.toLowerCase().includes(filter.toLowerCase());

function Results({ coffees }: { coffees: Coffee[] }) {
  return (
    <ul className="grid gap-1 text-sm">
      {coffees.slice(0, 8).map((coffee) => (
        <li key={coffee.id}>{coffee.name}</li>
      ))}
    </ul>
  );
}

function Controls({
  filter,
  onFilterChange,
  count,
  onCount,
}: {
  filter: string;
  onFilterChange: (value: string) => void;
  count: number;
  onCount: () => void;
}) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="grid gap-1">
        <label htmlFor="memo-filter">Filtro</label>
        <input
          id="memo-filter"
          value={filter}
          onChange={(event) => onFilterChange(event.target.value)}
        />
      </div>
      <button onClick={onCount}>Cambio ajeno al listado: {count}</button>
    </div>
  );
}

function PlainFilter() {
  const [filter, setFilter] = useState("");
  const [count, setCount] = useState(0);

  console.count("Filtrado sin useMemo");
  const visible = bigCatalog.filter((coffee) => matches(coffee, filter));

  return (
    <>
      <Controls
        filter={filter}
        onFilterChange={setFilter}
        count={count}
        onCount={() => setCount((previous) => previous + 1)}
      />
      <p>Coincidencias: {visible.length}</p>
      <Results coffees={visible} />
    </>
  );
}

function MemoFilter() {
  const [filter, setFilter] = useState("");
  const [count, setCount] = useState(0);

  const visible = useMemo(() => {
    console.count("Filtrado con useMemo");
    return bigCatalog.filter((coffee) => matches(coffee, filter));
  }, [filter]);

  return (
    <>
      <Controls
        filter={filter}
        onFilterChange={setFilter}
        count={count}
        onCount={() => setCount((previous) => previous + 1)}
      />
      <p>Coincidencias: {visible.length}</p>
      <Results coffees={visible} />
    </>
  );
}

export function MemoLab() {
  const [memo, setMemo] = useState(false);

  return (
    <section className="space-y-4">
      <h1>Experimento: useMemo</h1>
      <p className="text-stone-600">
        2.000 cafés de prueba. Abre la consola y compara los contadores al
        pulsar el botón que no tiene nada que ver con el listado.
      </p>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          className="w-auto"
          checked={memo}
          onChange={(event) => setMemo(event.target.checked)}
        />
        Usar useMemo
      </label>
      {memo ? <MemoFilter /> : <PlainFilter />}
    </section>
  );
}
