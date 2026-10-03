import { mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { SandboxAccessError, type SandboxFile, type SandboxTree } from "@/lib/contracts";

export interface SandboxFs {
  write(rel: string, content: string): Promise<"create" | "modify">;
  read(rel: string): Promise<string>;
  /** Replace a directory's contents (used to sync teacher-allowed course materials). */
  replaceDir(rel: string, files: { name: string; content: string }[]): Promise<void>;
  tree(): Promise<SandboxTree>;
  destroy(): Promise<void>;
}

const MAX_FILE = 256 * 1024;

/**
 * A private directory per environment. No shared filesystem between students:
 * every path is resolved against this environment's own root and rejected if it
 * escapes. No network access is ever granted to it.
 */
export function createLocalSandbox(sandboxId: string, base = path.join(process.cwd(), ".sandbox")): SandboxFs {
  if (!/^env-[A-Za-z0-9_-]+$/.test(sandboxId)) throw new SandboxAccessError("invalid sandbox id");
  const root = path.join(base, sandboxId);
  const resolve = (rel: string) => {
    const full = path.resolve(root, rel.replace(/^\/+/, ""));
    if (full !== root && !full.startsWith(root + path.sep)) throw new SandboxAccessError("path escapes sandbox");
    return full;
  };

  async function walk(dir: string, out: SandboxFile[]) {
    for (const entry of await readdir(dir, { withFileTypes: true }).catch(() => [])) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) await walk(full, out);
      else if (entry.isFile()) {
        const st = await stat(full);
        const text = st.size <= MAX_FILE ? await readFile(full, "utf8") : "";
        out.push({ path: path.relative(root, full), size: st.size, preview: text.slice(0, 400) });
      }
    }
  }

  return {
    async write(rel, content) {
      if (content.length > MAX_FILE) throw new SandboxAccessError("file too large");
      const full = resolve(rel);
      const existed = await stat(full).then(() => true, () => false);
      await mkdir(path.dirname(full), { recursive: true });
      await writeFile(full, content, "utf8");
      return existed ? "modify" : "create";
    },
    async replaceDir(rel, files) {
      const dir = resolve(rel);
      await rm(dir, { recursive: true, force: true });
      await mkdir(dir, { recursive: true });
      for (const f of files) await writeFile(resolve(path.join(rel, path.basename(f.name))), f.content, "utf8");
    },
    async read(rel) {
      const full = resolve(rel);
      const st = await stat(full).catch(() => null);
      if (!st?.isFile()) throw new SandboxAccessError(`no such file: ${rel}`);
      if (st.size > MAX_FILE) throw new SandboxAccessError("file too large to read");
      return readFile(full, "utf8");
    },
    async tree() {
      await mkdir(root, { recursive: true });
      const files: SandboxFile[] = [];
      await walk(root, files);
      files.sort((a, b) => a.path.localeCompare(b.path));
      return { root: sandboxId, files, totalBytes: files.reduce((n, f) => n + f.size, 0) };
    },
    async destroy() {
      await rm(root, { recursive: true, force: true });
    },
  };
}
