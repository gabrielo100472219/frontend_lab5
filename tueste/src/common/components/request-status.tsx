export function Loading() {
  return <p role="status">Cargando…</p>;
}

export function ErrorMessage({ message }: { message: string }) {
  return <p role="alert">{message}</p>;
}
