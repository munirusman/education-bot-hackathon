import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

/**
 * Resume state is opaque to the app: sealed with AES-256-GCM before it touches
 * Postgres and never serialised to the browser. The key comes from
 * RESUME_STATE_KEY (64 hex chars) or is generated once into .data/.
 */
let cached: Buffer | undefined;

function key(): Buffer {
  if (cached) return cached;
  const fromEnv = process.env.RESUME_STATE_KEY;
  if (fromEnv) {
    const b = Buffer.from(fromEnv, "hex");
    if (b.length !== 32) throw new Error("RESUME_STATE_KEY must be 32 bytes (64 hex chars)");
    return (cached = b);
  }
  const file = path.join(process.cwd(), ".data", "resume.key");
  if (existsSync(file)) return (cached = Buffer.from(readFileSync(file, "utf8").trim(), "hex"));
  mkdirSync(path.dirname(file), { recursive: true });
  const fresh = randomBytes(32);
  writeFileSync(file, fresh.toString("hex"), { mode: 0o600 });
  return (cached = fresh);
}

export function sealState(value: unknown): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const body = Buffer.concat([cipher.update(JSON.stringify(value), "utf8"), cipher.final()]);
  return [iv, cipher.getAuthTag(), body].map((b) => b.toString("base64")).join(".");
}

export function openState<T = unknown>(sealed: string): T {
  const [iv, tag, body] = sealed.split(".").map((p) => Buffer.from(p, "base64"));
  if (!iv || !tag || !body) throw new Error("malformed sealed state");
  const decipher = createDecipheriv("aes-256-gcm", key(), iv);
  decipher.setAuthTag(tag);
  return JSON.parse(Buffer.concat([decipher.update(body), decipher.final()]).toString("utf8")) as T;
}
