import { coffeeSchema } from "./coffee.schema";
import type { Coffee, CoffeeInput } from "./model";

// P4 (lab 5): the coffees live in a REST API (json-server, `npm run api`)
// instead of coffees.json + localStorage. Same functions, same signatures:
// nothing outside this file had to change.
const baseUrl = "http://localhost:3001/coffees";

const jsonHeaders = {
  Accept: "application/json",
  "Content-Type": "application/json",
};

export async function getCoffees(signal: AbortSignal): Promise<Coffee[]> {
  const response = await fetch(baseUrl, { signal });
  if (!response.ok) throw new Error("No se ha podido cargar el catálogo.");
  return (await response.json()) as Coffee[];
}

export async function getCoffee(
  id: string,
  signal: AbortSignal,
): Promise<Coffee | null> {
  if (!/^[1-9]\d*$/.test(id)) return null;
  const response = await fetch(`${baseUrl}/${id}`, { signal });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("No se ha podido cargar el café.");
  return (await response.json()) as Coffee;
}

// Without an id it's a POST and json-server assigns the next numeric id;
// with one it's a PUT that replaces the coffee.
export async function saveCoffee(
  input: CoffeeInput,
  id?: number,
): Promise<Coffee> {
  const values = coffeeSchema.parse(input);
  const response = await fetch(
    id === undefined ? baseUrl : `${baseUrl}/${id}`,
    {
      method: id === undefined ? "POST" : "PUT",
      headers: jsonHeaders,
      body: JSON.stringify(id === undefined ? values : { ...values, id }),
    },
  );
  if (response.status === 404) throw new Error("Café no encontrado.");
  if (!response.ok) throw new Error("No se ha podido guardar el café.");
  return (await response.json()) as Coffee;
}

export async function deleteCoffee(id: number): Promise<void> {
  const response = await fetch(`${baseUrl}/${id}`, { method: "DELETE" });
  if (!response.ok) throw new Error("No se ha podido eliminar el café.");
}
