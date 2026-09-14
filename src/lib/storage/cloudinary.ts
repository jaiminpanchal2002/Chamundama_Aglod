import "server-only";
import { v2 as cloudinary } from "cloudinary";

/**
 * Cloudinary storage (spec §41, §17). Public CMS media is uploaded as normal
 * delivery assets; donation payment proofs are uploaded as `authenticated`
 * (private) resources and only ever fetched server-side through a signed URL,
 * so they are never publicly reachable.
 */

let configured = false;
function ensureConfigured() {
  if (configured) return;
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  configured = true;
}

export function cloudinaryConfigured(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET,
  );
}

/** Upload a public CMS image (hero, gallery, QR, campaigns). Returns the URL. */
export async function uploadPublicMedia(
  buffer: Buffer,
  folder: string,
): Promise<string> {
  ensureConfigured();
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: `chamunda/${folder}`,
          resource_type: "image",
          type: "upload",
        },
        (err, result) => {
          if (err || !result) return reject(err ?? new Error("Upload failed"));
          resolve(result.secure_url);
        },
      )
      .end(buffer);
  });
}

// --- Private proof driver (StorageDriver-compatible) ----------------------

interface ProofKey {
  publicId: string;
  resourceType: string;
  format?: string;
}

function encodeKey(k: ProofKey): string {
  return `cld:${k.resourceType}:${k.format ?? ""}:${k.publicId}`;
}
function decodeKey(key: string): ProofKey | null {
  if (!key.startsWith("cld:")) return null;
  const rest = key.slice(4);
  const first = rest.indexOf(":");
  const second = rest.indexOf(":", first + 1);
  if (first < 0 || second < 0) return null;
  return {
    resourceType: rest.slice(0, first),
    format: rest.slice(first + 1, second) || undefined,
    publicId: rest.slice(second + 1),
  };
}

export const cloudinaryDriver = {
  async put(buffer: Buffer, ext: string): Promise<string> {
    ensureConfigured();
    const isPdf = ext === "pdf";
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "chamunda/proofs",
            // Private, non-listable delivery; requires a signed URL to fetch.
            type: "authenticated",
            resource_type: isPdf ? "image" : "image",
          },
          (err, result) => {
            if (err || !result)
              return reject(err ?? new Error("Upload failed"));
            resolve(
              encodeKey({
                publicId: result.public_id,
                resourceType: result.resource_type,
                format: result.format,
              }),
            );
          },
        )
        .end(buffer);
    });
  },

  async get(key: string): Promise<Buffer> {
    ensureConfigured();
    const k = decodeKey(key);
    if (!k) throw new Error("Invalid cloudinary key");
    const url = cloudinary.url(k.publicId, {
      type: "authenticated",
      resource_type: k.resourceType as "image",
      format: k.format,
      sign_url: true,
      secure: true,
    });
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
    return Buffer.from(await res.arrayBuffer());
  },

  async remove(key: string): Promise<void> {
    ensureConfigured();
    const k = decodeKey(key);
    if (!k) return;
    await cloudinary.uploader
      .destroy(k.publicId, {
        type: "authenticated",
        resource_type: k.resourceType as "image",
      })
      .catch(() => undefined);
  },

  async exists(key: string): Promise<boolean> {
    ensureConfigured();
    const k = decodeKey(key);
    if (!k) return false;
    try {
      await cloudinary.api.resource(k.publicId, {
        type: "authenticated",
        resource_type: k.resourceType as "image",
      });
      return true;
    } catch {
      return false;
    }
  },
};
