"use client";
import { FileText } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { SandboxTree } from "@/lib/contracts";
import { cx } from "../orbit/core";
import { useEventSource } from "./useLiveRefresh";

/** Read-only view of the student's workspace. Opening a file is audited server-side. */
export function SandboxViewer({ environmentId }: { environmentId: string }) {
  const [tree, setTree] = useState<SandboxTree | null>(null);
  const [open, setOpen] = useState<{ path: string; content: string } | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const res = await fetch(`/api/teacher/environments/${environmentId}/files`, { cache: "no-store" });
    if (res.ok) setTree(await res.json());
    else setError("Couldn’t read this workspace.");
  }, [environmentId]);
  useEffect(() => void load(), [load]);
  useEventSource(`/api/teacher/environments/${environmentId}/stream`, (e) => e?.type === "file-change" && load(), 500);

  async function view(path: string) {
    const res = await fetch(`/api/teacher/environments/${environmentId}/files?path=${encodeURIComponent(path)}`);
    setOpen(res.ok ? await res.json() : { path, content: "(couldn’t read this file)" });
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="type-caption m-0 text-fg-3">Files in this student’s private workspace. Course files appear under <span className="font-mono">materials/</span>.</p>
      {error && <p className="type-caption text-danger-ink">{error}</p>}
      {tree && !tree.files.length && <p className="type-body text-fg-3">The workspace is empty.</p>}
      {tree?.files.map((f) => (
        <button
          key={f.path}
          type="button"
          onClick={() => view(f.path)}
          className={cx("flex cursor-pointer items-center gap-2.5 rounded-sm border bg-card px-3 py-2.5 text-left type-rule text-fg-1", open?.path === f.path ? "border-line-2" : "border-line hover:bg-sand-50")}
        >
          <FileText size={15} className="flex-none text-fg-2" aria-hidden />
          <span className="truncate">{f.path}</span>
          <span className="type-caption ml-auto flex-none text-fg-3">{f.size} B</span>
        </button>
      ))}
      {open && <pre className="type-rule max-h-72 overflow-auto whitespace-pre-wrap rounded-sm bg-sunken px-2.5 py-2 text-xs">{open.content}</pre>}
    </div>
  );
}
