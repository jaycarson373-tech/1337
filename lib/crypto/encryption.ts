import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

const VERSION = "v1";

function deriveKey(secret: string) {
  return createHash("sha256").update(secret).digest();
}

export function encryptSecret(value: string, secret: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", deriveKey(secret), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return [
    VERSION,
    iv.toString("base64url"),
    tag.toString("base64url"),
    encrypted.toString("base64url")
  ].join(":");
}

export function decryptSecret(payload: string, secret: string) {
  const [version, iv, tag, encrypted] = payload.split(":");

  if (version !== VERSION || !iv || !tag || !encrypted) {
    throw new Error("Encrypted payload is invalid");
  }

  const decipher = createDecipheriv(
    "aes-256-gcm",
    deriveKey(secret),
    Buffer.from(iv, "base64url")
  );
  decipher.setAuthTag(Buffer.from(tag, "base64url"));

  return Buffer.concat([
    decipher.update(Buffer.from(encrypted, "base64url")),
    decipher.final()
  ]).toString("utf8");
}
