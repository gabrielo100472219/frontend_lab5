import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { coffeeSchema } from "../../core/coffees/coffee.schema";
import {
  roastLabels,
  type CoffeeInput,
  type Roast,
} from "../../core/coffees/model";

interface Props {
  initialValues?: CoffeeInput;
  onSave: (values: CoffeeInput) => Promise<void>;
}

// El precio vacío es NaN: así el esquema lo rechaza como "no es un número".
const emptyValues: CoffeeInput = {
  name: "",
  origin: "",
  roast: "medium",
  price: Number.NaN,
  notes: "",
};

const roasts = Object.keys(roastLabels) as Roast[];

interface FieldMeta {
  isTouched: boolean;
  isValid: boolean;
  errors: ({ message?: string } | undefined)[];
}

const isInvalid = (meta: FieldMeta) => meta.isTouched && !meta.isValid;

function FieldError({ name, meta }: { name: string; meta: FieldMeta }) {
  if (!isInvalid(meta)) return null;
  // onChange y onSubmit validan con el mismo esquema: quitamos los repetidos.
  const messages = new Set(meta.errors.map((error) => error?.message));
  return (
    <p id={`${name}-error`} role="alert">
      {[...messages].join(" ")}
    </p>
  );
}

const errorId = (name: string, meta: FieldMeta) =>
  isInvalid(meta) ? `${name}-error` : undefined;

export function EdicionComponent({ initialValues = emptyValues, onSave }: Props) {
  const [saveError, setSaveError] = useState("");
  const form = useForm({
    defaultValues: initialValues,
    validators: { onChange: coffeeSchema, onSubmit: coffeeSchema },
    onSubmit: async ({ value }) => {
      setSaveError("");
      try {
        await onSave(value);
      } catch {
        setSaveError(
          "No se ha podido guardar. Los datos siguen en el formulario.",
        );
      }
    },
  });

  return (
    <form
      className="space-y-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-8"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
    >
      {(
        [
          { name: "name", label: "Nombre" },
          { name: "origin", label: "Origen" },
        ] as const
      ).map((config) => (
        <form.Field key={config.name} name={config.name}>
          {(field) => (
            <div className="grid gap-1">
              <label htmlFor={field.name}>{config.label}</label>
              <input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                aria-invalid={isInvalid(field.state.meta)}
                aria-describedby={errorId(field.name, field.state.meta)}
              />
              <FieldError name={field.name} meta={field.state.meta} />
            </div>
          )}
        </form.Field>
      ))}

      <form.Field name="roast">
        {(field) => (
          <div className="grid gap-1">
            <label htmlFor={field.name}>Tueste</label>
            <select
              id={field.name}
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(event) =>
                field.handleChange(event.target.value as Roast)
              }
              aria-invalid={isInvalid(field.state.meta)}
              aria-describedby={errorId(field.name, field.state.meta)}
            >
              {roasts.map((roast) => (
                <option key={roast} value={roast}>
                  {roastLabels[roast]}
                </option>
              ))}
            </select>
            <FieldError name={field.name} meta={field.state.meta} />
          </div>
        )}
      </form.Field>

      <form.Field name="price">
        {(field) => (
          <div className="grid gap-1">
            <label htmlFor={field.name}>Precio (€)</label>
            <input
              id={field.name}
              name={field.name}
              type="number"
              inputMode="decimal"
              step="0.1"
              min="0"
              max="200"
              value={Number.isNaN(field.state.value) ? "" : field.state.value}
              onBlur={field.handleBlur}
              onChange={(event) =>
                field.handleChange(event.target.valueAsNumber)
              }
              aria-invalid={isInvalid(field.state.meta)}
              aria-describedby={errorId(field.name, field.state.meta)}
            />
            <FieldError name={field.name} meta={field.state.meta} />
          </div>
        )}
      </form.Field>

      <form.Field name="notes">
        {(field) => (
          <div className="grid gap-1">
            <label htmlFor={field.name}>Notas de cata (opcional)</label>
            <textarea
              id={field.name}
              name={field.name}
              rows={3}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(event) => field.handleChange(event.target.value)}
              aria-invalid={isInvalid(field.state.meta)}
              aria-describedby={[
                `${field.name}-count`,
                errorId(field.name, field.state.meta),
              ]
                .filter(Boolean)
                .join(" ")}
            />
            <p id={`${field.name}-count`} className="text-xs text-stone-500">
              {field.state.value.length}/120
            </p>
            <FieldError name={field.name} meta={field.state.meta} />
          </div>
        )}
      </form.Field>

      {saveError && <p role="alert">{saveError}</p>}
      <form.Subscribe selector={(state) => state.isSubmitting}>
        {(isSubmitting) => (
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Guardando…" : "Guardar café"}
          </button>
        )}
      </form.Subscribe>
    </form>
  );
}
