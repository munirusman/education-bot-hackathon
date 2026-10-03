"use client";
import { useState } from "react";
import { BUILTIN_TOOL_NAMES, DEFAULT_TOOLS, type BuiltinToolName, type Policy } from "@/lib/contracts";

const STYLES = [
  { v: "hint-only", label: "Hint only", help: "Never gives the answer; asks a leading question." },
  { v: "guided-steps", label: "Guided steps", help: "Breaks the problem into steps; student does the work." },
  { v: "explain", label: "Explain fully", help: "Explains concepts and worked examples." },
] as const;

const toLocal = (iso?: string) => (iso ? new Date(iso).toISOString().slice(0, 16) : "");

export function PolicyEditor({ classId, initial, materials }: { classId: string; initial: Policy; materials: { id: string; name: string }[] }) {
  const [p, setP] = useState(initial);
  const [win, setWin] = useState(Boolean(initial.assessmentWindow));
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof Policy>(k: K, v: Policy[K]) => setP((x) => ({ ...x, [k]: v }));
  const enabled = (t: BuiltinToolName) => p.tools[t] ?? DEFAULT_TOOLS[t];
  const toggle = (list: BuiltinToolName[], t: BuiltinToolName) => (list.includes(t) ? list.filter((x) => x !== t) : [...list, t]);

  async function save() {
    setSaving(true);
    setMsg(null);
    const { version: _v, ...policy } = p;
    const body = { policy: { ...policy, assessmentWindow: win ? (p.assessmentWindow ?? { startsAt: new Date().toISOString(), style: "hint-only", lockedTools: [], clarifyOnly: true }) : null } };
    const res = await fetch(`/api/teacher/classes/${classId}/policy`, { method: "PUT", body: JSON.stringify(body) });
    const out = await res.json();
    setSaving(false);
    setMsg(res.ok ? { ok: true, text: `Saved as version ${out.version}. It applies on each student's next question.` } : { ok: false, text: out.error });
    if (res.ok) setP((x) => ({ ...x, version: out.version }));
  }

  return (
    <div className="space-y-6">
      <section className="card grid gap-4 sm:grid-cols-2">
        <div><label className="label">Policy name</label><input className="input" value={p.name} onChange={(e) => set("name", e.target.value)} /></div>
        <div><label className="label">Subject</label><input className="input" value={p.subject} onChange={(e) => set("subject", e.target.value)} /></div>
        <div className="sm:col-span-2"><label className="label">Unit / context</label><input className="input" value={p.unit ?? ""} onChange={(e) => set("unit", e.target.value || undefined)} placeholder="Unit 3: kinematics" /></div>
      </section>

      <section className="card space-y-2">
        <h2 className="font-semibold">Tutoring style</h2>
        {STYLES.map((s) => (
          <label key={s.v} className="flex items-start gap-2 text-sm">
            <input type="radio" name="style" checked={p.style === s.v} onChange={() => set("style", s.v)} className="mt-1" />
            <span><strong>{s.label}</strong> <span className="text-slate-500">{s.help}</span></span>
          </label>
        ))}
        <div><label className="label">Extra guidance (appended after the fixed safety rules)</label><textarea className="input" rows={3} value={p.guidance} onChange={(e) => set("guidance", e.target.value)} /></div>
      </section>

      <section className="card">
        <h2 className="mb-2 font-semibold">Tools</h2>
        <table className="w-full text-sm">
          <thead><tr className="text-left text-xs uppercase text-slate-500"><th className="py-1">Tool</th><th>Allowed</th><th>Needs my approval</th></tr></thead>
          <tbody>
            {BUILTIN_TOOL_NAMES.map((t) => (
              <tr key={t} className="border-t border-slate-100">
                <td className="py-1.5 font-mono">{t}{t === "webSearch" && <span className="ml-2 font-sans text-xs text-amber-700">student sandboxes have no internet by default</span>}</td>
                <td><input type="checkbox" aria-label={`allow ${t}`} checked={enabled(t)} onChange={(e) => set("tools", { ...p.tools, [t]: e.target.checked })} /></td>
                <td><input type="checkbox" aria-label={`approve ${t}`} disabled={!enabled(t)} checked={p.approvalRequired.includes(t)} onChange={() => set("approvalRequired", toggle(p.approvalRequired, t))} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="card">
        <h2 className="mb-2 font-semibold">Course materials students can open</h2>
        {materials.length ? materials.map((m) => (
          <label key={m.id} className="mr-4 inline-flex items-center gap-2 text-sm">
            <input type="checkbox" checked={p.materials.includes(m.id)} onChange={() => set("materials", p.materials.includes(m.id) ? p.materials.filter((x) => x !== m.id) : [...p.materials, m.id])} />
            {m.name}
          </label>
        )) : <p className="text-sm text-slate-500">No materials uploaded for this class.</p>}
      </section>

      <section className="card grid gap-4 sm:grid-cols-3">
        <div><label className="label">Model</label><input className="input" value={p.model} onChange={(e) => set("model", e.target.value || "default")} /></div>
        <div><label className="label">Questions per student per day</label><input type="number" min={1} max={500} className="input" value={p.limits.turnsPerDay} onChange={(e) => set("limits", { ...p.limits, turnsPerDay: Number(e.target.value) })} /></div>
        <div><label className="label">Max tokens per answer</label><input type="number" min={256} className="input" value={p.limits.maxTokensPerTurn} onChange={(e) => set("limits", { ...p.limits, maxTokensPerTurn: Number(e.target.value) })} /></div>
      </section>

      <section className="card space-y-2">
        <label className="flex items-center gap-2 font-semibold"><input type="checkbox" checked={win} onChange={(e) => setWin(e.target.checked)} /> Assessment mode</label>
        <p className="text-sm text-slate-500">During the window the tutor is locked down: it only clarifies the question, with the tools below.</p>
        {win && p.assessmentWindow && (
          <div className="grid gap-3 sm:grid-cols-2">
            <div><label className="label">Starts</label><input type="datetime-local" className="input" value={toLocal(p.assessmentWindow.startsAt)} onChange={(e) => set("assessmentWindow", { ...p.assessmentWindow!, startsAt: new Date(e.target.value).toISOString() })} /></div>
            <div><label className="label">Ends</label><input type="datetime-local" className="input" value={toLocal(p.assessmentWindow.endsAt)} onChange={(e) => set("assessmentWindow", { ...p.assessmentWindow!, endsAt: e.target.value ? new Date(e.target.value).toISOString() : undefined })} /></div>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={p.assessmentWindow.clarifyOnly} onChange={(e) => set("assessmentWindow", { ...p.assessmentWindow!, clarifyOnly: e.target.checked })} /> Clarify the question only (no hints)</label>
          </div>
        )}
        {win && !p.assessmentWindow && <button className="btn" onClick={() => set("assessmentWindow", { startsAt: new Date().toISOString(), style: "hint-only", lockedTools: [], clarifyOnly: true })}>Set window</button>}
      </section>

      <div className="flex items-center gap-3">
        <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save policy"}</button>
        <span className="text-sm text-slate-500">Current version: v{p.version}</span>
        {msg && <span role="status" className={`text-sm ${msg.ok ? "text-emerald-700" : "text-red-600"}`}>{msg.text}</span>}
      </div>
    </div>
  );
}
