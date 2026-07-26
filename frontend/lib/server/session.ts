const SESSION_SECRET =
  process.env.SESSION_SECRET || "dev-secret-change-in-production";

async function getKey(): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(SESSION_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function signSession(userId: string): Promise<string> {
  const key = await getKey();
  const encoder = new TextEncoder();
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(userId));
  const sigHex = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `${userId}.${sigHex}`;
}

export async function verifySession(token: string): Promise<string | null> {
  const dotIdx = token.lastIndexOf(".");

  if (dotIdx === -1) {
    return isValidUserId(token) ? token : null;
  }

  const userId = token.slice(0, dotIdx);
  const sigHex = token.slice(dotIdx + 1);

  const key = await getKey();
  const encoder = new TextEncoder();
  const expected = await crypto.subtle.sign("HMAC", key, encoder.encode(userId));
  const expectedHex = Array.from(new Uint8Array(expected))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  if (sigHex.length !== expectedHex.length) return null;

  let mismatch = 0;
  for (let i = 0; i < sigHex.length; i++) {
    mismatch |= sigHex.charCodeAt(i) ^ expectedHex.charCodeAt(i);
  }
  return mismatch === 0 ? userId : null;
}

function isValidUserId(value: string): boolean {
  return /^[a-zA-Z0-9_-]{1,64}$/.test(value);
}

export function needsResign(token: string): boolean {
  return !token.includes(".");
}