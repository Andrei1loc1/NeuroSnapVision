/**
 * Server-side environment helpers.
 * Safe to use only in server contexts (API routes, server components, Prisma).
 */

export const BACKEND_URL =
  process.env.BACKEND_URL ||
  "http://127.0.0.1:8000";

export const YOLO_SPACE_URL =
  process.env.YOLO_SPACE_URL ||
  "http://127.0.0.1:7861";

export const CLASSIFIER_SPACE_URL =
  process.env.CLASSIFIER_SPACE_URL ||
  "http://127.0.0.1:7862";

export const OLLAMA_CLOUD_URL =
  process.env.OLLAMA_CLOUD_URL || "http://localhost:11434";

export const OLLAMA_MODEL =
  process.env.OLLAMA_MODEL || "nemotron-3-ultra:cloud";

export const OLLAMA_CLOUD_API_KEY =
  process.env.OLLAMA_CLOUD_API_KEY || "";

export const INTERNAL_API_TOKEN =
  process.env.INTERNAL_API_TOKEN || "";

/**
 * Headers to forward to the internal backend for shared-secret auth.
 * When INTERNAL_API_TOKEN is unset (dev mode), the backend allows all
 * requests with a warning, so this still works locally.
 */
export function backendHeaders(): Record<string, string> {
  return { "X-Internal-Token": INTERNAL_API_TOKEN };
}

export function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}
