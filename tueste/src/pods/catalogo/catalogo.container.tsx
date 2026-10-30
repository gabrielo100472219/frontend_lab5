import { useCoffees } from "../../core/coffees/hooks";
import { useCart } from "../../core/cart/cart-context";
import { ErrorMessage, Loading } from "../../common/components/request-status";
import { CatalogoComponent } from "./catalogo.component";
import type { CatalogoFilters } from "./catalogo.vm";

interface Props {
  filters: CatalogoFilters;
  onFiltersChange: (filters: CatalogoFilters) => void;
}

export function CatalogoContainer({ filters, onFiltersChange }: Props) {
  const { coffees, loading, error } = useCoffees();
  const { cart, addToCart, clearCart } = useCart();

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;

  const query = (filters.q ?? "").trim().toLowerCase();
  const visible = coffees.filter(
    (coffee) =>
      coffee.name.toLowerCase().includes(query) &&
      (!filters.roast || coffee.roast === filters.roast),
  );
  const cartTotal = cart.reduce((sum, coffee) => sum + coffee.price, 0);

  return (
    <CatalogoComponent
      coffees={visible}
      totalCoffees={coffees.length}
      filters={filters}
      onFiltersChange={onFiltersChange}
      cartCount={cart.length}
      cartTotal={cartTotal}
      onAdd={addToCart}
      onClearCart={clearCart}
    />
  );
}
