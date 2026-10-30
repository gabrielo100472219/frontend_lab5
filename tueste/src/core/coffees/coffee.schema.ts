import { z } from "zod";

export const coffeeSchema = z.object({
  name: z.string().trim().min(2, "El nombre necesita al menos dos caracteres."),
  origin: z
    .string()
    .trim()
    .min(2, "El origen necesita al menos dos caracteres."),
  roast: z.enum(["light", "medium", "dark"], {
    error: "Elige un tueste: claro, medio u oscuro.",
  }),
  price: z
    .number({ error: "Introduce un precio." })
    .positive("El precio tiene que ser mayor que 0.")
    .max(200, "El precio no puede pasar de 200 €."),
  notes: z
    .string()
    .trim()
    .max(120, "Las notas pueden tener como mucho 120 caracteres."),
});
