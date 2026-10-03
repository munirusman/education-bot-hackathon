"use client";
import { useRouter } from "next/navigation";
import { Pause, Play, RotateCcw, SlidersHorizontal, StickyNote, X } from "lucide-react";
import { useState } from "react";
import { BUILTIN_TOOL_NAMES, DEFAULT_TOOLS, TUTORING_STYLES, type EffectivePolicy, type HarnessEvent, type PolicyOverride } from "@/lib/contracts";
import { Avatar, Button, Eyebrow, IconButton } from "../orbit/core";
import { Select, Textarea } from "../orbit/forms";
import { Dialog, Tabs, useToast } from "../orbit/feedback";
import { ActionRequest, RuleCard, StateBadge, type SessionState } from "../orbit/product";
import { describeInput } from "./ClassroomLive";
import { SandboxViewer } from "./SandboxViewer";
import { TeacherThread } from "./TeacherThread";

export const STYLE_RULE: Record<string, string> = {
  "hint-only": "Give hints, but never reveal the final answer.",
  "guided-steps": "Walk through it step by step. The student does the work.",
  explain: "Explain the idea fully, with a worked example on a similar problem.",
};
const STYLE_LABEL: Record<string, string> = { "hint-only": "Hint only", "guided-steps": "Guided steps", explain: "Explain fully" };

type Props = {
  classId: string;
  environmentId: string;
  studentName: string;
  state: SessionState;
  paused: boolean;
  caption?: string | null;
  policy: EffectivePolicy;
  override: PolicyOverride | null;
  approvals: { id: string; toolName: string; input: unknown }[];
  flags: { id: string; kind: string; detail: string; evidence: string }[];
  turns: { id: string; prompt: string; startedAt: string; policyVersion: number }[];
  actions: { id: string; action: string; at: string }[];
  events: (HarnessEvent & { turnId?: string })[];
};

type Tab = "session" | "rules" | "files" | "activity";

export function SessionPanel(p: Props) {
  const router = useRouter();
  const toast = useToast();
  const first = p.studentName.split(" ")[0] ?? p.studentName;
  const [tab, setTab] = useState<Tab>("session");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState<"pause" | "reset" | null>(null);

  async function act(body: object, done: string) {
    setBusy(true);
    const res = await fetch(`/api/teacher/environments/${p.environmentId}/actions`, { method: "POST", body: JSON.stringify(body) });
    setBusy(false);
    if (!res.ok) {
      toast((await res.json().catch(() => ({}))).error ?? "That didn’t work", "warning");
      return false;
    }
    toast(done);
    router.refresh();
    return true;
  }

  return (
    <aside className="flex min-h-0 w-[420px] flex-none flex-col border-l border-line bg-card" aria-label={`${p.studentName}’s session`}>
      <div className="flex flex-col gap-3 px-[18px] pt-4">
        <div className="flex items-center gap-2.5">
          <Avatar name={p.studentName} size={36} />
          <div className="min-w-0 flex-1">
            <div className="type-h3 truncate">{p.studentName}</div>
            {p.caption && <div className="type-caption truncate text-fg-3">{p.caption}</div>}
          </div>
          <StateBadge state={p.state} />
          <IconButton icon={X} label="Close" size="sm" href={`/teacher/${p.classId}`} />
        </div>
        <div className="flex gap-2">
          {p.paused ? (
            <Button size="sm" icon={Play} disabled={busy} onClick={() => act({ action: "resume" }, "Tutor resumed")}>Resume tutor</Button>
          ) : (
            <Button size="sm" variant="danger" icon={Pause} disabled={busy} onClick={() => setConfirm("pause")}>Pause tutor</Button>
          )}
          <Button size="sm" variant="secondary" icon={SlidersHorizontal} onClick={() => setTab("rules")}>Change behavior</Button>
        </div>
        <Tabs<Tab>
          value={tab}
          onChange={setTab}
          items={[
            { id: "session", label: "Session", count: p.approvals.length || undefined },
            { id: "rules", label: "Rules" },
            { id: "files", label: "Files" },
            { id: "activity", label: "Activity", count: p.flags.length || undefined },
          ]}
        />
      </div>

      {tab === "session" && (
        <>
          <div className="flex min-h-0 flex-1 flex-col bg-page">
            {(p.approvals.length > 0 || p.flags.length > 0) && (
              <div className="flex flex-col gap-2.5 border-b border-line p-[18px]">
                {p.approvals.map((a) => (
                  <ActionRequest
                    key={a.id}
                    student={p.studentName}
                    action={{ bash: "run code", write: "save a file", edit: "edit a file", read: "read a file" }[a.toolName] ?? `use ${a.toolName}`}
                    detail={describeInput(a.input)}
                    busy={busy}
                    onApprove={() => act({ action: "approve", approvalId: a.id, approved: true }, `Approved once for ${first}`)}
                    onDeny={() => act({ action: "approve", approvalId: a.id, approved: false, reason: "Not right now" }, `Denied for ${first}`)}
                  />
                ))}
                {p.flags.slice(0, 2).map((f) => (
                  <div key={f.id} className={f.kind === "wellbeing" ? "rounded-sm bg-danger-bg px-3 py-2 type-caption text-danger-ink" : "rounded-sm bg-sunken px-3 py-2 type-caption text-fg-2"}>
                    <span className="font-semibold">{f.detail}</span> <span className="font-mono">“{f.evidence}”</span>
                  </div>
                ))}
              </div>
            )}
            <div className="min-h-0 flex-1">
              <TeacherThread environmentId={p.environmentId} initialEvents={p.events} studentName={first} paused={p.paused} />
            </div>
          </div>
          <div className="flex flex-col gap-2 border-t border-line bg-card p-3.5">
            <Textarea rows={2} value={note} maxLength={1000} onChange={(e) => setNote(e.target.value)} placeholder={`Leave a note for ${first}…`} aria-label={`Note for ${first}`} />
            <div className="flex items-center justify-between gap-2">
              <span className="type-caption text-fg-3">Appears in {first}’s session as a teacher note.</span>
              <Button size="sm" variant="teacher" icon={StickyNote} disabled={busy || !note.trim()} onClick={async () => (await act({ action: "note", text: note.trim() }, `Note sent to ${first}`)) && setNote("")}>Send note</Button>
            </div>
          </div>
        </>
      )}

      {tab === "rules" && <RulesTab {...p} first={first} busy={busy} act={act} />}

      {tab === "files" && (
        <div className="flex-1 overflow-auto p-[18px]"><SandboxViewer environmentId={p.environmentId} /></div>
      )}

      {tab === "activity" && (
        <div className="flex flex-1 flex-col gap-5 overflow-auto p-[18px]">
          {p.flags.length > 0 && (
            <section className="flex flex-col gap-2">
              <Eyebrow>Flags</Eyebrow>
              {p.flags.map((f) => (
                <div key={f.id} className="type-body"><span className="font-medium">{f.detail}</span> <span className="type-rule text-xs text-fg-3">“{f.evidence}”</span></div>
              ))}
            </section>
          )}
          <section className="flex flex-col gap-2">
            <Eyebrow>Questions</Eyebrow>
            {p.turns.map((t) => (
              <div key={t.id}>
                <div className="font-mono text-[11px] text-fg-3">{new Date(t.startedAt).toLocaleString()} · rules v{t.policyVersion}</div>
                <div className="type-body">{t.prompt}</div>
              </div>
            ))}
            {!p.turns.length && <p className="type-body text-fg-3">No questions yet.</p>}
          </section>
          <section className="flex flex-col gap-1.5">
            <Eyebrow>Your actions</Eyebrow>
            {p.actions.slice(0, 15).map((a) => (
              <div key={a.id} className="flex items-baseline gap-2 type-body">
                <span className="font-mono text-xs">{a.action}</span>
                <span className="type-caption text-fg-3">{new Date(a.at).toLocaleString()}</span>
              </div>
            ))}
          </section>
          <section className="flex flex-col gap-2 border-t border-line pt-4">
            <Eyebrow>Workspace</Eyebrow>
            <p className="type-caption m-0 text-fg-3">Resetting clears {first}’s files and the tutor’s memory of the conversation. The transcript stays here.</p>
            <div><Button size="sm" variant="secondary" icon={RotateCcw} disabled={busy} onClick={() => setConfirm("reset")}>Reset workspace</Button></div>
          </section>
        </div>
      )}

      <Dialog
        open={confirm === "pause"}
        title={`Pause ${first}’s tutor?`}
        description={`${first} will see “Your teacher paused the tutor.” You can resume anytime.`}
        onClose={() => setConfirm(null)}
        actions={
          <>
            <Button variant="secondary" onClick={() => setConfirm(null)}>Cancel</Button>
            <Button variant="danger" icon={Pause} disabled={busy} onClick={async () => { setConfirm(null); await act({ action: "pause" }, "Tutor paused"); }}>Pause tutor</Button>
          </>
        }
      />
      <Dialog
        open={confirm === "reset"}
        title={`Reset ${first}’s workspace?`}
        description={`${first}’s files are deleted and the tutor starts the conversation fresh. You’ll still see the full transcript.`}
        onClose={() => setConfirm(null)}
        actions={
          <>
            <Button variant="secondary" onClick={() => setConfirm(null)}>Cancel</Button>
            <Button variant="danger" icon={RotateCcw} disabled={busy} onClick={async () => { setConfirm(null); await act({ action: "reset", confirm: true }, "Workspace reset"); }}>Reset workspace</Button>
          </>
        }
      />
    </aside>
  );
}

function RulesTab(p: Props & { first: string; busy: boolean; act: (body: object, done: string) => Promise<boolean> }) {
  const [style, setStyle] = useState<string>(p.override?.style ?? "");
  const [guidance, setGuidance] = useState(p.override?.guidance ?? "");
  const [tools, setTools] = useState<Record<string, boolean | undefined>>(p.override?.tools ?? {});
  const scope = (overridden: boolean) => (overridden ? `${p.studentName} only` : "All students");
  const on = (t: (typeof BUILTIN_TOOL_NAMES)[number]) => p.policy.tools[t] ?? DEFAULT_TOOLS[t];
  const allowed = BUILTIN_TOOL_NAMES.filter((t) => on(t) && t !== "askUserQuestions");

  const body = (): PolicyOverride | null => {
    const o: PolicyOverride = {};
    if (style) o.style = style as PolicyOverride["style"];
    if (guidance.trim()) o.guidance = guidance.trim();
    const t = Object.fromEntries(Object.entries(tools).filter(([, v]) => v !== undefined));
    if (Object.keys(t).length) o.tools = t;
    return Object.keys(o).length ? o : null;
  };

  return (
    <div className="flex flex-1 flex-col gap-3 overflow-auto p-[18px]">
      <p className="type-caption m-0 text-fg-3">Rules applied to {p.first}’s tutor right now.</p>
      {p.policy.assessmentActive && <RuleCard kind="mode" rule="Test mode: only clarify the question. No hints, no tools." scope="All students" />}
      <RuleCard rule={STYLE_RULE[p.policy.style]} scope={scope(Boolean(p.override?.style))} />
      {p.policy.guidance && <RuleCard rule={p.policy.guidance} scope={scope(Boolean(p.override?.guidance))} />}
      <RuleCard kind="permission" rule={allowed.length ? `Can use: ${allowed.join(", ")}.${p.policy.approvalRequired.length ? ` Asks you first for: ${p.policy.approvalRequired.join(", ")}.` : ""}` : "No tools."} scope={scope(Boolean(p.override?.tools))} />

      <div className="mt-2 flex flex-col gap-3 rounded-md border border-line bg-page p-3.5">
        <div>
          <Eyebrow className="mb-1">Change behavior</Eyebrow>
          <div className="type-h3">Just for {p.first}</div>
        </div>
        <Select label="Tutoring style" value={style} onChange={(e) => setStyle(e.target.value)} options={[{ value: "", label: "Same as the class" }, ...TUTORING_STYLES.map((s) => ({ value: s, label: STYLE_LABEL[s]! }))]} />
        <div className="flex flex-col gap-1.5">
          <span className="type-label">Tools</span>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
            {BUILTIN_TOOL_NAMES.filter((t) => t !== "askUserQuestions").map((t) => (
              <label key={t} className="flex items-center justify-between gap-2 type-rule text-xs">
                {t}
                <select
                  aria-label={`${t} for ${p.first}`}
                  value={tools[t] === undefined ? "" : String(tools[t])}
                  onChange={(e) => setTools((x) => ({ ...x, [t]: e.target.value === "" ? undefined : e.target.value === "true" }))}
                  className="h-7 cursor-pointer rounded-sm border border-line-2 bg-card px-1.5 font-sans text-xs text-fg-1"
                >
                  <option value="">Class</option>
                  <option value="true">On</option>
                  <option value="false">Off</option>
                </select>
              </label>
            ))}
          </div>
        </div>
        <Textarea mono rows={2} label="Extra guidance" value={guidance} onChange={(e) => setGuidance(e.target.value)} placeholder="This student needs more scaffolding." hint="Write it the way you’d say it to a teaching assistant." />
        <div className="flex gap-2">
          <Button size="sm" disabled={p.busy} onClick={() => p.act({ action: "override", override: body() }, `Rules updated for ${p.first}`)}>Apply to {p.first}</Button>
          {p.override && (
            <Button size="sm" variant="ghost" disabled={p.busy} onClick={async () => { if (await p.act({ action: "override", override: null }, `${p.first} follows the class rules`)) { setStyle(""); setGuidance(""); setTools({}); } }}>Use class rules</Button>
          )}
        </div>
        <p className="type-caption m-0 text-fg-3">Takes effect on {p.first}’s next question.</p>
      </div>
    </div>
  );
}
