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

// The server's error envelope (concept 02): { error: { code, message, field } }
interface ApiError {
  code: string;
  message: string;
  field?: string;
}

export class HttpError extends Error {
  readonly status: number;
  readonly apiError?: ApiError;

  constructor(
    method: string,
    url: string,
    status: number,
    statusText: string,
    apiError?: ApiError,
  ) {
    super(`${method} ${url} → ${status} ${apiError?.message ?? statusText}`);
    this.name = "HttpError";
    this.status = status;
    this.apiError = apiError;
  }
}

// Not every error comes with the envelope (a proxy's HTML page, for instance).
const readApiError = async (
  response: Response,
): Promise<ApiError | undefined> => {
  try {
    const body = (await response.json()) as { error?: ApiError };
    return typeof body.error?.message === "string" ? body.error : undefined;
  } catch {
    return undefined;
  }
};

type Method = "GET" | "POST" | "PUT" | "DELETE";

interface RequestOptions {
  method?: Method;
  body?: unknown;
  signal?: AbortSignal;
  // D2: each attempt is aborted after this long.
  timeoutMs?: number;
  // D2: extra attempts after a network error, a timeout or a 5xx.
  // POST is not idempotent, so it isn't retried unless asked explicitly.
  retries?: number;
  onRetry?: (attempt: number, delayMs: number, error: unknown) => void;
}

const IDEMPOTENT: Method[] = ["GET", "PUT", "DELETE"];
const RETRY_BASE_DELAY_MS = 500;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Retry what may work a moment later: no response at all (network error,
// timeout) or a server failure (5xx). A 4xx would fail again in the same way,
// and a cancellation by the caller is a decision, not a failure.
const isRetryable = (error: unknown) =>
  error instanceof HttpError
    ? error.status >= 500
    : error instanceof TypeError ||
      (error instanceof DOMException && error.name === "TimeoutError");

export const request = async <T>(
  path: string,
  {
    method = "GET",
    retries = IDEMPOTENT.includes(method) ? 3 : 0,
    onRetry,
    ...options
  }: RequestOptions = {},
): Promise<T> => {
  for (let attempt = 0; ; attempt++) {
    try {
      return await requestOnce<T>(path, { method, ...options });
    } catch (error) {
      if (
        attempt >= retries ||
        !isRetryable(error) ||
        options.signal?.aborted
      ) {
        throw error;
      }
      const delayMs = RETRY_BASE_DELAY_MS * 2 ** attempt; // 500, 1000, 2000
      console.warn(
        `Reintento ${attempt + 1}/${retries} en ${delayMs} ms`,
        error,
      );
      onRetry?.(attempt + 1, delayMs, error);
      await wait(delayMs);
    }
  }
};

// One attempt: headers, error handling and unwrapping the { data } envelope.
const requestOnce = async <T>(
  path: string,
  { method = "GET", body, signal, timeoutMs = 5000 }: RequestOptions,
): Promise<T> => {
  const url = `${API_BASE}${path}`;
  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  // Aborts on whichever comes first: the timeout or the caller's signal.
  const timeout = AbortSignal.timeout(timeoutMs);
  const response = await fetch(url, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
  });

  if (!response.ok) {
    throw new HttpError(
      method,
      url,
      response.status,
      response.statusText,
      await readApiError(response),
    );
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

// Since D1 the server answers 404 when the id doesn't exist: for this
// function that's "not found" (null), not an error.
export const getHotel = async (id: string): Promise<Hotel | null> => {
  const path = `/hotels/${id}`;
  try {
    return parseResponse(hotelSchema, await request<unknown>(path), path);
  } catch (error) {
    if (error instanceof HttpError && error.status === 404) {
      return null;
    }
    throw error;
  }
};

export const createHotel = (hotel: NewHotel) =>
  request<Hotel>("/hotels", { method: "POST", body: hotel });

export const updateHotel = (id: string, changes: Partial<NewHotel>) =>
  request<Hotel>(`/hotels/${id}`, { method: "PUT", body: changes });

export const deleteHotel = (id: string) =>
  request<void>(`/hotels/${id}`, { method: "DELETE" });

export const getCities = () => request<City[]>("/cities");
