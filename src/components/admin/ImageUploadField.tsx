"use client";

import { useState } from "react";
import { Loader2, Upload } from "lucide-react";

/**
 * Uploads an image to /api/admin/media and stores the returned URL in a hidden
 * input so it submits with a plain server-action form. Accepts a pasted URL too.
 */
export function ImageUploadField({
  name,
  label,
  defaultValue,
  folder = "general",
}: {
  name: string;
  label: string;
  defaultValue?: string | null;
  folder?: string;
}) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File) {
    setLoading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.set("file", file);
      fd.set("folder", folder);
      const res = await fetch("/api/admin/media", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload failed");
      setUrl(json.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <span className="admin-label">{label}</span>
      <div className="flex items-center gap-3">
        {url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt=""
            className="h-16 w-16 rounded border border-slate-200 object-cover"
          />
        )}
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          Upload
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) upload(f);
            }}
          />
        </label>
      </div>
      <input
        type="text"
        name={name}
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Image URL (or upload above)"
        className="admin-input mt-2"
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
