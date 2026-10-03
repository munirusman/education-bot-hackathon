"use client";
import { useEffect, useState } from "react";
import type { SandboxTree } from "@/lib/contracts";
import { useEventSource } from "./useLiveRefresh";

/** Read-only file tree of the student's sandbox. Opening a file is audited server-side. */
export function SandboxViewer({ environmentId }: { environmentId: string }) {
  const [tree, setTree] = useState<SandboxTree | null>(null);
  const [open, setOpen] = useState<{ path: string; content: string } | null>(null);
  const [error, setError] = useState("");

  const load = async () => {
    const res = await fetch(`/api/teacher/environments/${environmentId}/files`, { cache: "no-store" });
    if (res.ok) setTree(await res.json());
    else setError("Could not read the sandbox.");
  };
  useEffect(() => void load(), [environmentId]); // eslint-disable-line react-hooks/exhaustive-deps
  useEventSource(`/api/teacher/environments/${environmentId}/stream`, (e) => e?.type === "file-change" && load(), 500);

  async function view(path: string) {
    const res = await fetch(`/api/teacher/environments/${environmentId}/files?path=${encodeURIComponent(path)}`);
    setOpen(res.ok ? await res.json() : { path, content: "(could not read file)" });
  }

  return (
    <div className="card">
      <h3 className="mb-2 font-semibold">Sandbox files</h3>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {tree && !tree.files.length && <p className="text-sm text-slate-500">The sandbox is empty.</p>}
      <ul className="text-sm">
        {tree?.files.map((f) => (
          <li key={f.path}>
            <button className="font-mono text-indigo-700 hover:underline" onClick={() => view(f.path)}>{f.path}</button>
            <span className="ml-2 text-xs text-slate-400">{f.size} B</span>
          </li>
        ))}
      </ul>
      {open && (
        <div className="mt-2">
          <div className="text-xs font-semibold text-slate-500">{open.path}</div>
          <pre className="max-h-60 overflow-auto rounded bg-slate-50 p-2 text-xs">{open.content}</pre>
        </div>
      )}
    </div>
  );
}
