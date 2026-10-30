import { useEffect, useState, type ReactNode } from "react";
import type { Coffee } from "../coffees/model";
import { CartContext } from "./cart-context";

const storageKey = "tueste-lab4-cart";

function readCart(): Coffee[] {
  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? (JSON.parse(raw) as Coffee[]) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  // La función se ejecuta sólo en el primer render: no leemos localStorage en cada uno.
  const [cart, setCart] = useState<Coffee[]>(readCart);

  // Guardar es sincronizar con algo externo a React: va en un efecto.
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(cart));
  }, [cart]);

  function addToCart(coffee: Coffee) {
    setCart((previous) => [...previous, coffee]);
  }

  function clearCart() {
    setCart([]);
  }

  return (
    <CartContext.Provider value={{ cart, addToCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}
