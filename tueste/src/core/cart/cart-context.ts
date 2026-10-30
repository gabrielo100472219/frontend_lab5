import { createContext, useContext } from "react";
import type { Coffee } from "../coffees/model";

interface CartContextValue {
  cart: Coffee[];
  addToCart: (coffee: Coffee) => void;
  clearCart: () => void;
}

export const CartContext = createContext<CartContextValue | null>(null);

export function useCart() {
  const cart = useContext(CartContext);
  if (cart === null) throw new Error("useCart necesita un CartProvider.");
  return cart;
}
