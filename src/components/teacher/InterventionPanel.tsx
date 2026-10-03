"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BUILTIN_TOOL_NAMES, TUTORING_STYLES, type PolicyOverride } from "@/lib/contracts";

type Props = {
  environmentId: string;
  status: string;
  override: PolicyOverride | null;
  approvals: { id: string; toolName: string; input: unknown }[];
};

export function InterventionPanel({ environmentId, status, override, approvals }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [style, setStyle] = useState(override?.style ?? "");
  const [guidance, setGuidance] = useState(override?.guidance ?? "");
  const [tools, setTools] = useState<Record<string, boolean | undefined>>(override?.tools ?? {});
  const paused = status === "paused";

  async function act(body: object, after?: () => void) {
    setBusy(true);
    setError("");
    const res = await fetch(`/api/teacher/environments/${environmentId}/actions`, { method: "POST", body: JSON.stringify(body) });
    setBusy(false);
    if (!res.ok) return setError((await res.json()).error ?? "That didn't work");
    after?.();
    router.refresh();
  }

  const overrideBody = () => {
    const o: PolicyOverride = {};
    if (style) o.style = style as PolicyOverride["style"];
    if (guidance.trim()) o.guidance = guidance.trim();
    const t = Object.fromEntries(Object.entries(tools).filter(([, v]) => v !== undefined));
    if (Object.keys(t).length) o.tools = t;
    return Object.keys(o).length ? o : null;
  };

  return (
    <div className="space-y-4">
      {error && <p role="alert" className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      {approvals.length > 0 && (
        <div className="card border-amber-300 bg-amber-50">
          <h3 className="mb-2 font-semibold">Approval needed</h3>
          {approvals.map((a) => (
            <div key={a.id} className="mb-2 text-sm">
              <p>The tutor wants to use <code className="font-mono">{a.toolName}</code>:</p>
              <pre className="my-1 max-h-32 overflow-auto rounded bg-white p-2 text-xs">{JSON.stringify(a.input, null, 2)}</pre>
              <div className="flex gap-2">
                <button className="btn btn-primary" disabled={busy} onClick={() => act({ action: "approve", approvalId: a.id, approved: true })}>Approve</button>
                <button className="btn" disabled={busy} onClick={() => act({ action: "approve", approvalId: a.id, approved: false, reason: "Not right now" })}>Deny</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="card space-y-2">
        <h3 className="font-semibold">Session</h3>
        <div className="flex flex-wrap gap-2">
          {paused ? (
            <button className="btn btn-primary" disabled={busy} onClick={() => act({ action: "resume" })}>Resume student</button>
          ) : (
            <button className="btn" disabled={busy} onClick={() => act({ action: "pause" })}>Pause student</button>
          )}
          <button
            className="btn btn-danger"
            disabled={busy}
            onClick={() => window.confirm("Reset this environment? The sandbox and its files are destroyed and the tutor forgets the conversation. The transcript stays in the record.") && act({ action: "reset", confirm: true })}
          >
            Reset environment
          </button>
        </div>
        <p className="text-xs text-slate-500">Status: {status}. Pausing blocks new questions and saves the session.</p>
      </div>

      <div className="card space-y-2">
        <h3 className="font-semibold">Send a note</h3>
        <textarea className="input" rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Shown to the student as a teacher message and given to the tutor on the next turn." maxLength={1000} />
        <button className="btn btn-primary" disabled={busy || !note.trim()} onClick={() => act({ action: "note", text: note.trim() }, () => setNote(""))}>Send note</button>
      </div>

      <div className="card space-y-2">
        <h3 className="font-semibold">Policy override for this student</h3>
        <div>
          <label className="label">Style</label>
          <select className="input" value={style} onChange={(e) => setStyle(e.target.value)}>
            <option value="">Use class policy</option>
            {TUTORING_STYLES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Tools (override)</label>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
            {BUILTIN_TOOL_NAMES.map((t) => (
              <label key={t} className="inline-flex items-center gap-1">
                <select className="rounded border border-slate-200 text-xs" value={tools[t] === undefined ? "" : String(tools[t])} onChange={(e) => setTools((x) => ({ ...x, [t]: e.target.value === "" ? undefined : e.target.value === "true" }))} aria-label={`override ${t}`}>
                  <option value="">class</option><option value="true">on</option><option value="false">off</option>
                </select>
                {t}
              </label>
            ))}
          </div>
        </div>
        <div><label className="label">Extra guidance</label><textarea className="input" rows={2} value={guidance} onChange={(e) => setGuidance(e.target.value)} placeholder="Extra scaffolding for this student" /></div>
        <div className="flex gap-2">
          <button className="btn btn-primary" disabled={busy} onClick={() => act({ action: "override", override: overrideBody() })}>Save override</button>
          {override && <button className="btn" disabled={busy} onClick={() => act({ action: "override", override: null }, () => { setStyle(""); setGuidance(""); setTools({}); })}>Clear</button>}
        </div>
        <p className="text-xs text-slate-500">Applies from this student's next question.</p>
      </div>
    </div>
  );
}
