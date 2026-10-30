import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { roastLabels, type Coffee } from "../../core/coffees/model";
import { formatPrice } from "../../common/format";

interface Props {
  coffee: Coffee;
  onDelete: () => Promise<void>;
}

export function DetalleComponent({ coffee, onDelete }: Props) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  async function confirmDelete() {
    setDeleting(true);
    setDeleteError("");
    try {
      await onDelete();
    } catch {
      setDeleteError("No se ha podido eliminar el café.");
      setDeleting(false);
    }
  }

  return (
    <article className="space-y-5 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <header>
        <h1>{coffee.name}</h1>
        <p className="text-stone-500">{coffee.origin}</p>
      </header>
      <dl className="grid gap-4 sm:grid-cols-3">
        <div>
          <dt className="text-sm text-stone-500">Tueste</dt>
          <dd className="font-medium">{roastLabels[coffee.roast]}</dd>
        </div>
        <div>
          <dt className="text-sm text-stone-500">Precio</dt>
          <dd className="font-medium">{formatPrice(coffee.price)}</dd>
        </div>
        <div>
          <dt className="text-sm text-stone-500">Identificador</dt>
          <dd className="font-medium">#{coffee.id}</dd>
        </div>
      </dl>
      <div>
        <h2 className="text-base">Notas de cata</h2>
        <p className="text-stone-700">{coffee.notes || "Sin notas."}</p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Link
          className="inline-flex rounded-xl bg-amber-100 px-4 py-2 text-sm font-semibold no-underline hover:bg-amber-200"
          to="/coffees/$coffeeId/edit"
          params={{ coffeeId: String(coffee.id) }}
        >
          Editar café
        </Link>
        {!confirming && (
          <button
            className="bg-rose-700 hover:bg-rose-800"
            onClick={() => setConfirming(true)}
          >
            Eliminar
          </button>
        )}
      </div>
      {confirming && (
        <div
          role="group"
          aria-labelledby="delete-question"
          className="flex flex-wrap items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4"
        >
          <p id="delete-question" className="font-semibold text-rose-900">
            ¿Eliminar «{coffee.name}» del catálogo?
          </p>
          <button
            className="bg-rose-700 hover:bg-rose-800"
            disabled={deleting}
            onClick={() => void confirmDelete()}
          >
            {deleting ? "Eliminando…" : "Sí, eliminar"}
          </button>
          <button
            autoFocus
            className="bg-white text-stone-800 ring-1 ring-stone-300 hover:bg-stone-100"
            disabled={deleting}
            onClick={() => setConfirming(false)}
          >
            Cancelar
          </button>
        </div>
      )}
      {deleteError && <p role="alert">{deleteError}</p>}
    </article>
  );
}
