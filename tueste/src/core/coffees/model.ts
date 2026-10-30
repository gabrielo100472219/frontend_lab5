export type Roast = "light" | "medium" | "dark";

export interface Coffee {
  id: number;
  name: string;
  origin: string;
  roast: Roast;
  price: number;
  notes: string;
}

export type CoffeeInput = Omit<Coffee, "id">;

export const roastLabels: Record<Roast, string> = {
  light: "Claro",
  medium: "Medio",
  dark: "Oscuro",
};
