import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

/**
 * Opaque, expiring download tokens.
 *
 * WordPress stores the `package` URL verbatim in the update_plugins site transient
 * and fetches it later, so whatever we put in that URL ends up in wp_options, in our
 * access logs, and in Referer headers. Putting the raw licence key there makes a
 * long-lived credential leak into all three. Instead we hand out an AES-256-GCM blob
 * that only this server can open, and that stops working on its own.
 *
 * TTL is deliberately generous: WP caches the transient for up to 12h and the plugin
 * for 6h, so a short token would expire between "an update is available" and the
 * customer actually clicking Update — turning a security nicety into a broken update.
 */
const TTL_SECONDS = 60 * 60 * 48;

type Payload = { key: string; site: string; exp: number };

function secret(): Buffer {
  const raw = process.env.WISPLY_DOWNLOAD_SECRET;
  if (!raw || raw.length < 16) {
    throw new Error("WISPLY_DOWNLOAD_SECRET is not set (need >= 16 chars).");
  }
  // Normalise any passphrase to the 32 bytes AES-256 wants.
  return createHash("sha256").update(raw).digest();
}

const b64url = (b: Buffer) => b.toString("base64url");

export function signDownloadToken(key: string, site: string, now = Date.now()): string {
  const payload: Payload = { key, site, exp: Math.floor(now / 1000) + TTL_SECONDS };
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", secret(), iv);
  const body = Buffer.concat([cipher.update(JSON.stringify(payload), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${b64url(iv)}.${b64url(body)}.${b64url(tag)}`;
}

/** Returns the payload, or null for anything malformed, tampered with, or expired. */
export function verifyDownloadToken(token: string, now = Date.now()): Payload | null {
  try {
    const [ivRaw, bodyRaw, tagRaw] = token.split(".");
    if (!ivRaw || !bodyRaw || !tagRaw) return null;

    const decipher = createDecipheriv("aes-256-gcm", secret(), Buffer.from(ivRaw, "base64url"));
    decipher.setAuthTag(Buffer.from(tagRaw, "base64url"));
    const plain = Buffer.concat([
      decipher.update(Buffer.from(bodyRaw, "base64url")),
      decipher.final(),
    ]).toString("utf8");

    const payload = JSON.parse(plain) as Payload;
    if (typeof payload?.key !== "string" || typeof payload?.site !== "string") return null;
    if (typeof payload.exp !== "number" || payload.exp * 1000 < now) return null;

    return payload;
  } catch {
    // GCM auth failure lands here — that is the point. Never distinguish "tampered"
    // from "malformed" to a caller.
    return null;
  }
}
