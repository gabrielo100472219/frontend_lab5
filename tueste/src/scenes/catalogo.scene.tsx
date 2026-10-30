import { useState } from "react";
import { OfferCountdown } from "../common/components/offer-countdown";
import { useNavigate } from "@tanstack/react-router";
import { CatalogoContainer, type CatalogoFilters } from "../pods/catalogo";

export function CatalogoScene({ filters }: { filters: CatalogoFilters }) {
  const [showOffer, setShowOffer] = useState(true);
  const navigate = useNavigate({ from: "/coffees/" });

  function onFiltersChange(next: CatalogoFilters) {
    void navigate({ search: next, replace: true });
  }

  return (
    <>
      <header className="space-y-1">
        <h1>Catálogo de cafés</h1>
        <p className="text-stone-600">
          Cafés de especialidad tostados esta semana.
        </p>
      </header>
      <aside
        aria-label="Oferta"
        className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-emerald-50 p-4 text-emerald-900"
      >
        {showOffer ? <OfferCountdown /> : <p>Oferta oculta.</p>}
        <button onClick={() => setShowOffer((previous) => !previous)}>
          {showOffer ? "Ocultar oferta" : "Mostrar oferta"}
        </button>
      </aside>
      <CatalogoContainer filters={filters} onFiltersChange={onFiltersChange} />
    </>
  );
}
