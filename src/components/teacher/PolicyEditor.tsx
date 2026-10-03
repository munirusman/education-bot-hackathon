"use client";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { useState } from "react";
import { BUILTIN_TOOL_NAMES, DEFAULT_TOOLS, type BuiltinToolName, type Policy } from "@/lib/contracts";
import { Button, Card } from "../orbit/core";
import { Checkbox, Input, Radio, Switch, Textarea } from "../orbit/forms";
import { useToast } from "../orbit/feedback";
import { RuleCard } from "../orbit/product";
import { STYLE_RULE } from "./SessionPanel";

const STYLES = [
  { v: "hint-only", label: "Hint only", help: "Never gives the answer. Offers one hint and a leading question." },
  { v: "guided-steps", label: "Guided steps", help: "Breaks the problem into steps. The student does each one." },
  { v: "explain", label: "Explain fully", help: "Explains the idea and works a similar example." },
] as const;

const TOOL_HELP: Record<string, string> = {
  read: "Open class files and the student’s own files",
  write: "Create files in the student’s workspace",
  edit: "Change files in the student’s workspace",
  bash: "Run code in the student’s private sandbox",
  grep: "Search inside files",
  glob: "List files",
  webSearch: "Search the web (sandboxes have no internet by default)",
  askUserQuestions: "Ask the student multiple-choice questions",
};

const toLocal = (iso?: string) => (iso ? new Date(new Date(iso).getTime() - new Date().getTimezoneOffset() * 60_000).toISOString().slice(0, 16) : "");

export function PolicyEditor({ classId, initial, materials }: { classId: string; initial: Policy; materials: { id: string; name: string }[] }) {
  const router = useRouter();
  const toast = useToast();
  const [p, setP] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = <K extends keyof Policy>(k: K, v: Policy[K]) => setP((x) => ({ ...x, [k]: v }));
  const enabled = (t: BuiltinToolName) => p.tools[t] ?? DEFAULT_TOOLS[t];
  const allowed = BUILTIN_TOOL_NAMES.filter(enabled);

  async function save() {
    setSaving(true);
    setError("");
    const { version: _v, ...policy } = p;
    const res = await fetch(`/api/teacher/classes/${classId}/policy`, { method: "PUT", body: JSON.stringify({ policy: { ...policy, approvalRequired: policy.approvalRequired.filter(enabled) } }) });
    const out = await res.json();
    setSaving(false);
    if (!res.ok) return setError(out.error ?? "Couldn’t save the rules.");
    setP((x) => ({ ...x, version: out.version }));
    toast("Rules saved. They apply from each student’s next question.");
    router.refresh();
  }

  return (
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="flex min-w-0 flex-col gap-4">
        <Card eyebrow="Class" title="What this class is working on">
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="Subject" value={p.subject} onChange={(e) => set("subject", e.target.value)} />
            <Input label="Unit" value={p.unit ?? ""} onChange={(e) => set("unit", e.target.value || undefined)} placeholder="Unit 3: kinematics" />
          </div>
        </Card>

        <Card eyebrow="Behavior" title="How the tutor helps">
          <div className="flex flex-col gap-2.5">
            {STYLES.map((s) => <Radio key={s.v} name="style" label={s.label} description={s.help} checked={p.style === s.v} onChange={() => set("style", s.v)} />)}
          </div>
          <Textarea mono rows={3} label="Your rule, in your words" value={p.guidance} onChange={(e) => set("guidance", e.target.value)} placeholder="Encourage students to draw a diagram before using any equation." hint="Write it the way you’d say it to a teaching assistant. Tutors get it word for word, after Orbit’s safety rules." />
        </Card>

        <Card eyebrow="Permissions" title="What the tutor can do">
          <div className="flex flex-col divide-y divide-[var(--border-1)]">
            {BUILTIN_TOOL_NAMES.map((t) => (
              <div key={t} className="flex items-center gap-3 py-2.5">
                <Switch size="sm" checked={enabled(t)} onChange={(v) => set("tools", { ...p.tools, [t]: v })} ariaLabel={`Allow ${t}`} />
                <div className="min-w-0 flex-1">
                  <div className="type-rule text-fg-1">{t}</div>
                  <div className="type-caption text-fg-3">{TOOL_HELP[t]}</div>
                </div>
                <Checkbox
                  label={<span className="type-caption text-fg-2">Ask me first</span>}
                  disabled={!enabled(t)}
                  checked={enabled(t) && p.approvalRequired.includes(t)}
                  onChange={(v) => set("approvalRequired", v ? [...p.approvalRequired, t] : p.approvalRequired.filter((x) => x !== t))}
                  ariaLabel={`Ask before ${t}`}
                />
              </div>
            ))}
          </div>
        </Card>

        <Card eyebrow="Files" title="Class files tutors can read">
          {materials.length ? (
            <div className="flex flex-col gap-2">
              {materials.map((m) => (
                <Checkbox key={m.id} label={<span className="type-rule">{m.name}</span>} checked={p.materials.includes(m.id)} onChange={(v) => set("materials", v ? [...p.materials, m.id] : p.materials.filter((x) => x !== m.id))} />
              ))}
            </div>
          ) : (
            <p className="type-body text-fg-3">No files uploaded for this class.</p>
          )}
        </Card>

        <Card eyebrow="Limits" title="Model and budget">
          <div className="grid gap-3 sm:grid-cols-3">
            <Input label="Model" value={p.model} onChange={(e) => set("model", e.target.value || "default")} className="font-mono" />
            <Input label="Questions per student per day" type="number" min={1} max={500} value={p.limits.turnsPerDay} onChange={(e) => set("limits", { ...p.limits, turnsPerDay: Number(e.target.value) })} />
            <Input label="Longest answer (tokens)" type="number" min={256} value={p.limits.maxTokensPerTurn} onChange={(e) => set("limits", { ...p.limits, maxTokensPerTurn: Number(e.target.value) })} />
          </div>
        </Card>

        <Card eyebrow="Test mode" title="Lock tutors down during a test" actions={<Switch checked={Boolean(p.assessmentWindow)} onChange={(v) => set("assessmentWindow", v ? { startsAt: new Date().toISOString(), style: "hint-only", lockedTools: [], clarifyOnly: true } : null)} ariaLabel="Test mode" />}>
          <p className="type-body m-0 text-fg-2">While it’s on, tutors only clarify what a question is asking. No hints, no tools.</p>
          {p.assessmentWindow && (
            <div className="grid gap-3 sm:grid-cols-2">
              <Input label="Starts" type="datetime-local" value={toLocal(p.assessmentWindow.startsAt)} onChange={(e) => e.target.value && set("assessmentWindow", { ...p.assessmentWindow!, startsAt: new Date(e.target.value).toISOString() })} />
              <Input label="Ends" hint="Leave empty to keep it on until you turn it off." type="datetime-local" value={toLocal(p.assessmentWindow.endsAt)} onChange={(e) => set("assessmentWindow", { ...p.assessmentWindow!, endsAt: e.target.value ? new Date(e.target.value).toISOString() : undefined })} />
            </div>
          )}
        </Card>
      </div>

      <div className="flex flex-col gap-3 xl:sticky xl:top-0">
        <Card eyebrow="Preview" title="Rules your tutors follow">
          <div className="flex flex-col gap-2.5">
            {p.assessmentWindow && <RuleCard kind="mode" rule="Test mode: only clarify the question. No hints, no tools." />}
            <RuleCard rule={STYLE_RULE[p.style]} />
            {p.guidance.trim() && <RuleCard rule={p.guidance.trim()} />}
            <RuleCard kind="permission" rule={allowed.length ? `Can use: ${allowed.join(", ")}.${p.approvalRequired.filter(enabled).length ? ` Asks you first for: ${p.approvalRequired.filter(enabled).join(", ")}.` : ""}` : "No tools."} />
          </div>
          <Button full icon={Check} onClick={save} disabled={saving}>{saving ? "Saving…" : "Save rules"}</Button>
          {error && <p role="alert" className="type-caption m-0 text-danger-ink">{error}</p>}
          <p className="type-caption m-0 text-fg-3">Version {p.version}. Changes apply from each student’s next question.</p>
        </Card>
      </div>
    </div>
  );
}
