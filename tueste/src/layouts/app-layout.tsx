import { Link, Outlet } from "@tanstack/react-router";
import { useCart } from "../core/cart/cart-context";
import { CartProvider } from "../core/cart/cart-provider";
import { formatBags } from "../common/format";

function CartBadge() {
  const { cart } = useCart();
  return (
    <p
      aria-live="polite"
      className="rounded-full border border-amber-200 bg-white px-3 py-1 text-sm font-semibold text-amber-900"
    >
      🛍️ {formatBags(cart.length)}
    </p>
  );
}

export function AppLayout() {
  return (
    <CartProvider>
      <main>
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 pb-4">
          <p className="text-sm font-bold uppercase tracking-widest text-amber-800">
            ☕ Tueste
          </p>
          <nav aria-label="Principal" className="flex flex-wrap gap-2">
            <Link to="/coffees" activeOptions={{ exact: true }}>
              Catálogo
            </Link>
            <Link to="/coffees/new">Añadir café</Link>
          </nav>
          <CartBadge />
        </header>
        <Outlet />
        <footer className="border-t border-stone-200 pt-6 text-xs text-stone-500">
          Datos de ejemplo. Los cambios se guardan solo en este navegador. ·{" "}
          <Link to="/experimentos/memo">Experimento useMemo</Link>
        </footer>
      </main>
    </CartProvider>
  );
}
