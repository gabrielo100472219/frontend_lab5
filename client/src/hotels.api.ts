import { z } from "zod";

// Only the fields the front uses: the server sends ~30 per hotel.
// The schema checks them at runtime and strips everything else.
const hotelSchema = z.object({
  id: z.string(),
  name: z.string(),
  city: z.string(),
  lowRate: z.number(),
  highRate: z.number(),
});

export type Hotel = z.infer<typeof hotelSchema>;

export type NewHotel = Omit<Hotel, "id">;

export interface City {
  id: string;
  name: string;
}

const API_BASE = import.meta.env.VITE_API_BASE;

export class HttpError extends Error {
  readonly status: number;

  constructor(method: string, url: string, status: number, statusText: string) {
    super(`${method} ${url} → ${status} ${statusText}`);
    this.name = "HttpError";
    this.status = status;
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
}

// Every call to the API goes through here: headers, error handling and
// unwrapping the { data } envelope live in one place.
export const request = async <T>(
  path: string,
  { method = "GET", body, signal }: RequestOptions = {},
): Promise<T> => {
  const url = `${API_BASE}${path}`;
  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(url, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    signal,
  });

  if (!response.ok) {
    throw new HttpError(method, url, response.status, response.statusText);
  }

  // 204 No Content: there is no body, so response.json() would throw.
  if (response.status === 204) {
    return undefined as T;
  }

  const { data } = (await response.json()) as { data: T };
  return data;
};

// A type assertion trusts the server; this actually checks what arrived.
const parseResponse = <T>(
  schema: z.ZodType<T>,
  data: unknown,
  path: string,
): T => {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new Error(
      `Respuesta inesperada de ${path}:\n${z.prettifyError(result.error)}`,
    );
  }
  return result.data;
};

export const getHotels = async (signal?: AbortSignal) =>
  parseResponse(
    z.array(hotelSchema),
    await request<unknown>("/hotels", { signal }),
    "/hotels",
  );

// The server answers 200 with {} (no data key) when the id doesn't exist,
// so a missing data means "not found", not an error.
export const getHotel = async (id: string): Promise<Hotel | null> => {
  const path = `/hotels/${id}`;
  const hotel = await request<unknown>(path);
  return hotel === undefined ? null : parseResponse(hotelSchema, hotel, path);
};

export const createHotel = (hotel: NewHotel) =>
  request<Hotel>("/hotels", { method: "POST", body: hotel });

export const updateHotel = (id: string, changes: Partial<NewHotel>) =>
  request<Hotel>(`/hotels/${id}`, { method: "PUT", body: changes });

export const deleteHotel = (id: string) =>
  request<void>(`/hotels/${id}`, { method: "DELETE" });

export const getCities = () => request<City[]>("/cities");
