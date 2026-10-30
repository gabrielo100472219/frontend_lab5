// The API lives on another origin (hotels-server started with USE_CORS=yes).
export const API_ORIGIN = import.meta.env.VITE_API_ORIGIN;

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
}

// Same contract as the lab client: Accept is mandatory, responses come
// wrapped in { data }, and DELETE answers 204 without a body.
export const request = async <T>(
  path: string,
  { method = 'GET', body }: RequestOptions = {}
): Promise<T> => {
  const url = `${API_ORIGIN}/api${path}`;
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!response.ok) {
    // hotels-server's error envelope: { error: { code, message, field } }
    const body = await response.json().catch(() => undefined);
    const message = body?.error?.message ?? response.statusText;
    throw new Error(`${method} ${url} → ${response.status} ${message}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const { data } = (await response.json()) as { data: T };
  return data;
};

// Thumbnails are served by hotels-server too (public/thumbnails), not by Vite.
export const toServerUrl = (path: string | undefined) =>
  `${API_ORIGIN}${path ?? '/thumbnails/new-hotel.jpg'}`;
