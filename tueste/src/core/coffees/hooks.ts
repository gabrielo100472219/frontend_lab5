import { useEffect, useState } from "react";
import { getCoffee, getCoffees } from "./api";
import type { Coffee } from "./model";

export function useCoffees() {
  const [coffees, setCoffees] = useState<Coffee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    getCoffees(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setCoffees(data);
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setError("No se ha podido cargar el catálogo.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, []);

  return { coffees, loading, error };
}

export function useCoffee(id: string) {
  const [coffee, setCoffee] = useState<Coffee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    setCoffee(null);

    getCoffee(id, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setCoffee(data);
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setError("No se ha podido cargar el café.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [id]);

  return { coffee, loading, error };
}
