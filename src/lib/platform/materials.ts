/**
 * Validation for teacher-uploaded course files. Files are stored as UTF-8 text
 * and copied into student sandboxes, so only text formats are accepted.
 */
export const MAX_MATERIAL_BYTES = 256 * 1024; // matches the sandbox per-file limit
export const ALLOWED_EXTENSIONS = ["md", "txt", "csv", "tsv", "json", "py", "js", "ts", "html", "css", "java", "c", "cpp", "r", "sql", "tex", "xml", "yaml", "yml"] as const;

export class MaterialError extends Error {}

/** Reduce an uploaded name to a safe single path segment. */
export function safeFileName(raw: string): string {
  const base = raw.split(/[\\/]/).pop() ?? "";
  const cleaned = base.normalize("NFKC").replace(/[^\w.\- ]/g, "_").replace(/\s+/g, "-").replace(/^\.+/, "").slice(0, 100);
  if (!cleaned) throw new MaterialError("That file needs a name.");
  return cleaned;
}

export function validateMaterial(name: string, bytes: Uint8Array): { name: string; content: string } {
  const safe = safeFileName(name);
  const ext = safe.includes(".") ? safe.split(".").pop()!.toLowerCase() : "";
  if (!(ALLOWED_EXTENSIONS as readonly string[]).includes(ext)) {
    throw new MaterialError(`${safe}: only text files can be uploaded (${ALLOWED_EXTENSIONS.slice(0, 6).map((e) => "." + e).join(", ")} and similar). Export PDFs or Word files as text first.`);
  }
  if (bytes.byteLength === 0) throw new MaterialError(`${safe} is empty.`);
  if (bytes.byteLength > MAX_MATERIAL_BYTES) throw new MaterialError(`${safe} is larger than ${MAX_MATERIAL_BYTES / 1024} KB.`);
  let content: string;
  try {
    content = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    throw new MaterialError(`${safe} isn’t plain UTF-8 text.`);
  }
  if (content.includes("\u0000")) throw new MaterialError(`${safe} looks like a binary file.`);
  return { name: safe, content };
}
