"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

export interface FormFieldSpec {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  textarea?: boolean;
  options?: string[];
  half?: boolean;
}

/** Generic public form that POSTs JSON to `endpoint` with a honeypot field. */
export function JsonForm({
  endpoint,
  fields,
  submitLabel,
  successTitle,
  successBody,
}: {
  endpoint: string;
  fields: FormFieldSpec[];
  submitLabel: string;
  successTitle: string;
  successBody: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const payload: Record<string, string> = {};
    fd.forEach((v, k) => (payload[k] = String(v)));
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Submission failed");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="card-temple text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-green-600" />
        <h3 className="mt-3 font-display text-xl text-temple-maroon">{successTitle}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{successBody}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card-temple space-y-4">
      {/* Honeypot */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((f) => (
          <label
            key={f.name}
            className={f.half ? "block" : "block sm:col-span-2"}
          >
            <span className="mb-1 block text-sm text-muted-foreground">
              {f.label} {f.required && <span className="text-temple-red">*</span>}
            </span>
            {f.textarea ? (
              <textarea name={f.name} required={f.required} rows={4} className="input" />
            ) : f.options ? (
              <select name={f.name} className="input" defaultValue="">
                <option value="" disabled>
                  Select…
                </option>
                {f.options.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            ) : (
              <input
                name={f.name}
                type={f.type || "text"}
                required={f.required}
                className="input"
              />
            )}
          </label>
        ))}
      </div>
      {error && (
        <p className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>
      )}
      <button type="submit" disabled={loading} className="btn-primary disabled:opacity-60">
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {submitLabel}
      </button>
    </form>
  );
}
