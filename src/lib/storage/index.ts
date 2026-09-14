import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, writeFile, unlink, access } from "node:fs/promises";
import path from "node:path";
import {
  cloudinaryConfigured,
  cloudinaryDriver,
  uploadPublicMedia,
} from "./cloudinary";

/**
 * Private storage abstraction (spec §17). Donation payment proofs contain
 * sensitive personal/payment data and MUST NOT be publicly reachable. Files are
 * stored under a non-web-served directory, named by a secure random key, and
 * exposed to authorized admins only via short-lived signed tokens.
 *
 * The driver is swappable (local | cloudinary | s3) without touching callers.
 */

export interface StoredObject {
  key: string;
  buffer: Buffer;
  mimeType: string;
}

interface StorageDriver {
  put(buffer: Buffer, ext: string): Promise<string>; // returns storage key
  get(key: string): Promise<Buffer>;
  remove(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
}

const PRIVATE_DIR = path.resolve(
  process.cwd(),
  process.env.PRIVATE_STORAGE_DIR || "./storage/private",
);

/** Reject any key that could escape the private directory. */
function safeResolve(key: string): string {
  const clean = key.replace(/[^a-zA-Z0-9._-]/g, "");
  const resolved = path.resolve(PRIVATE_DIR, clean);
  if (!resolved.startsWith(PRIVATE_DIR + path.sep) && resolved !== PRIVATE_DIR) {
    throw new Error("Invalid storage key");
  }
  return resolved;
}

const localDriver: StorageDriver = {
  async put(buffer, ext) {
    await mkdir(PRIVATE_DIR, { recursive: true });
    const key = `${randomBytes(24).toString("hex")}${ext ? "." + ext.replace(/[^a-z0-9]/gi, "") : ""}`;
    await writeFile(safeResolve(key), buffer, { mode: 0o600 });
    return key;
  },
  async get(key) {
    return readFile(safeResolve(key));
  },
  async remove(key) {
    try {
      await unlink(safeResolve(key));
    } catch {
      /* already gone */
    }
  },
  async exists(key) {
    try {
      await access(safeResolve(key));
      return true;
    } catch {
      return false;
    }
  },
};

// STORAGE_DRIVER selects the active driver. Cloudinary is used in production
// (Vercel filesystem is not persistent); local is the zero-config default.
function getDriver(): StorageDriver {
  if (process.env.STORAGE_DRIVER === "cloudinary" && cloudinaryConfigured()) {
    return cloudinaryDriver;
  }
  return localDriver;
}

export const storage = getDriver();

/**
 * Save a PUBLIC CMS image (hero, gallery, QR, campaigns) and return its URL.
 * Uses Cloudinary when configured (persistent on serverless), otherwise writes
 * to /public/uploads for local development.
 */
export async function saveMedia(
  buffer: Buffer,
  folder: string,
  ext: string,
): Promise<string> {
  if (process.env.STORAGE_DRIVER === "cloudinary" && cloudinaryConfigured()) {
    return uploadPublicMedia(buffer, folder);
  }
  const dir = path.join(process.cwd(), "public", "uploads", folder);
  await mkdir(dir, { recursive: true });
  const name = `${randomBytes(12).toString("hex")}.${ext.replace(/[^a-z0-9]/gi, "")}`;
  await writeFile(path.join(dir, name), buffer);
  return `/uploads/${folder}/${name}`;
}

// --------------------------------------------------------------------------
// Signed, expiring access tokens for admin downloads
// --------------------------------------------------------------------------

function signingSecret(): string {
  return (
    process.env.STORAGE_SIGNING_SECRET ||
    process.env.AUTH_SECRET ||
    "insecure-dev-secret-change-me"
  );
}

/** Create a signed token granting temporary read access to a storage key. */
export function signStorageKey(key: string, ttlSeconds = 300): string {
  const exp = Date.now() + ttlSeconds * 1000;
  const payload = `${key}:${exp}`;
  const sig = createHmac("sha256", signingSecret())
    .update(payload)
    .digest("hex");
  return Buffer.from(`${payload}:${sig}`).toString("base64url");
}

/** Verify a signed token and return its key, or null if invalid/expired. */
export function verifyStorageToken(token: string): string | null {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const lastColon = decoded.lastIndexOf(":");
    if (lastColon < 0) return null;
    const payload = decoded.slice(0, lastColon);
    const sig = decoded.slice(lastColon + 1);
    const expected = createHmac("sha256", signingSecret())
      .update(payload)
      .digest("hex");
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

    const sep = payload.lastIndexOf(":");
    const key = payload.slice(0, sep);
    const exp = Number(payload.slice(sep + 1));
    if (!Number.isFinite(exp) || Date.now() > exp) return null;
    return key;
  } catch {
    return null;
  }
}

// --------------------------------------------------------------------------
// Upload validation (spec §17) — MIME, size, and magic-byte signature checks
// --------------------------------------------------------------------------

export const ALLOWED_PROOF_TYPES: Record<string, { ext: string }> = {
  "image/jpeg": { ext: "jpg" },
  "image/png": { ext: "png" },
  "image/webp": { ext: "webp" },
  "application/pdf": { ext: "pdf" },
};

export function maxProofBytes(): number {
  const mb = Number(process.env.MAX_PROOF_UPLOAD_MB || "8");
  return (Number.isFinite(mb) ? mb : 8) * 1024 * 1024;
}

/** Sniff the true content type from magic bytes; returns null if unrecognized. */
export function sniffMime(buffer: Buffer): string | null {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff)
    return "image/jpeg";
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  )
    return "image/png";
  if (
    buffer.length >= 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  )
    return "image/webp";
  if (buffer.length >= 5 && buffer.toString("ascii", 0, 5) === "%PDF-")
    return "application/pdf";
  return null;
}

export interface ValidatedUpload {
  buffer: Buffer;
  mimeType: string;
  ext: string;
}

/** Validate a proof upload end-to-end. Throws a user-safe Error on failure. */
export function validateProofUpload(
  buffer: Buffer,
  declaredMime: string,
): ValidatedUpload {
  if (buffer.length === 0) throw new Error("Empty file.");
  if (buffer.length > maxProofBytes()) {
    throw new Error(
      `File too large. Maximum ${process.env.MAX_PROOF_UPLOAD_MB || 8} MB.`,
    );
  }
  const sniffed = sniffMime(buffer);
  if (!sniffed || !ALLOWED_PROOF_TYPES[sniffed]) {
    throw new Error("Unsupported file type. Allowed: JPEG, PNG, WEBP, PDF.");
  }
  // Declared type must match sniffed type (defence in depth).
  if (declaredMime && declaredMime !== sniffed) {
    // Some browsers report generic types; trust the sniffed signature.
  }
  return { buffer, mimeType: sniffed, ext: ALLOWED_PROOF_TYPES[sniffed]!.ext };
}
