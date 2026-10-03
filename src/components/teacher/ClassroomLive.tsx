"use client";
import { useRouter } from "next/navigation";
import { Search, TriangleAlert } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { tileState, type Dashboard, type SessionState } from "@/lib/platform/dashboard";
import type { ApprovalRow, FlagRow } from "@/lib/db/repo";
import { Badge, Button, Card } from "../orbit/core";
import { Input } from "../orbit/forms";
import { Tabs, useToast } from "../orbit/feedback";
import { ActionRequest, StudentTile } from "../orbit/product";
import { useEventSource } from "./useLiveRefresh";

export type DashboardData = Dashboard & { flags: (FlagRow & { studentName: string })[]; approvals: (ApprovalRow & { studentName: string })[] };
type Filter = "all" | SessionState | "flagged";

const FLAG_LABEL: Record<string, string> = {
  wellbeing: "Wellbeing",
  "answer-seeking": "Asked for answers",
  "instruction-bypass": "Tried to change the rules",
  "off-topic": "Off topic",
  stuck: "Stuck",
};

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
const firstName = (n: string) => n.split(" ")[0] ?? n;

export function ClassroomLive({ classId, initial, selected }: { classId: string; initial: DashboardData; selected?: string }) {
  const router = useRouter();
  const toast = useToast();
  const [data, setData] = useState(initial);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  useEffect(() => setData(initial), [initial]);

  const refresh = useCallback(async () => {
    const res = await fetch(`/api/teacher/classes/${classId}/dashboard`, { cache: "no-store" });
    if (res.ok) setData(await res.json());
  }, [classId]);
  useEventSource(`/api/teacher/classes/${classId}/stream`, refresh, 250);

  const tiles = data.tiles.map((t) => ({ ...t, state: tileState(t) }));
  const count = (s: SessionState) => tiles.filter((t) => t.state === s).length;
  const shown = tiles
    .filter((t) => filter === "all" || (filter === "flagged" ? t.flagCount > 0 : t.state === filter))
    .filter((t) => t.studentName.toLowerCase().includes(query.trim().toLowerCase()))
    .sort((a, b) => a.studentName.localeCompare(b.studentName));
  const wellbeing = data.flags.filter((f) => f.kind === "wellbeing");

  async function decide(a: ApprovalRow & { studentName: string }, approved: boolean) {
    setBusy(a.id);
    const res = await fetch(`/api/teacher/environments/${a.environmentId}/actions`, { method: "POST", body: JSON.stringify({ action: "approve", approvalId: a.id, approved, ...(approved ? {} : { reason: "Not right now" }) }) });
    setBusy(null);
    toast(res.ok ? (approved ? `Approved once for ${firstName(a.studentName)}` : `Denied for ${firstName(a.studentName)}`) : "That request has expired", res.ok ? "success" : "warning");
    refresh();
    router.refresh();
  }

  async function resolveFlag(id: string) {
    await fetch(`/api/teacher/flags/${id}`, { method: "DELETE" });
    refresh();
  }

  return (
    <div className="flex min-w-0 flex-col gap-5">
      {wellbeing.length > 0 && (
        <div role="alert" className="flex items-start gap-2.5 rounded-md border border-[var(--red-500)] bg-danger-bg px-3.5 py-3 text-danger-ink">
          <TriangleAlert size={16} className="mt-0.5 flex-none" aria-hidden />
          <div className="type-body">
            <span className="font-semibold">Wellbeing concern: {wellbeing.map((f) => f.studentName).join(", ")}.</span> Review the session and follow your school’s safeguarding process.
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {(["working", "stuck", "approval", "paused"] as const).map((s) => (
          <Card key={s} padding="p-3.5">
            <div><Badge tone={s} dot pulse={false}>{{ working: "Working", stuck: "Stuck", approval: "Needs approval", paused: "Paused" }[s]}</Badge></div>
            <div className="font-serif text-4xl leading-none text-fg-1">{count(s)}</div>
          </Card>
        ))}
      </div>

      {data.approvals.length > 0 && (
        <Card eyebrow="Waiting on you" title={plural(data.approvals.length, "tutor needs approval", "tutors need approval")}>
          <div className="grid gap-3 lg:grid-cols-2">
            {data.approvals.map((a) => (
              <ActionRequest
                key={a.id}
                student={a.studentName}
                action={{ bash: "run code", write: "save a file", edit: "edit a file", read: "read a file" }[a.toolName] ?? `use ${a.toolName}`}
                detail={describeInput(a.input)}
                busy={busy === a.id}
                onApprove={() => decide(a, true)}
                onDeny={() => decide(a, false)}
              />
            ))}
          </div>
        </Card>
      )}

      <Card eyebrow="This week" title="What students are asking about">
        {data.topics.length ? (
          <div className="flex flex-col gap-2">
            {data.topics.slice(0, 6).map((t) => (
              <div key={t.term} className="flex items-center gap-3">
                <span className="type-body w-40 flex-none truncate">{t.term}</span>
                <span className="h-1.5 flex-1 rounded-[3px] bg-sand-100">
                  <span className="block h-1.5 rounded-[3px] bg-plum-400" style={{ width: `${(t.count / data.topics[0]!.count) * 100}%` }} />
                </span>
                <span className="w-24 text-right font-mono text-xs leading-none text-fg-2">{plural(t.count, "question")}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="type-body text-fg-3">No questions yet this week.</p>
        )}
      </Card>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <Tabs<Filter>
          value={filter}
          onChange={setFilter}
          items={[
            { id: "all", label: "All", count: tiles.length },
            { id: "stuck", label: "Stuck", count: count("stuck") },
            { id: "approval", label: "Needs approval", count: count("approval") },
            { id: "working", label: "Working", count: count("working") },
            { id: "flagged", label: "Flagged", count: tiles.filter((t) => t.flagCount > 0).length },
          ]}
        />
        <div className="w-60"><Input icon={Search} size="sm" placeholder="Search students" aria-label="Search students" value={query} onChange={(e) => setQuery(e.target.value)} /></div>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3">
        {shown.map((t) => (
          <StudentTile
            key={t.environmentId}
            href={`/teacher/${classId}/students/${t.environmentId}`}
            name={t.studentName}
            state={t.state}
            selected={selected === t.environmentId}
            meta={t.turnsToday ? plural(t.turnsToday, "question") + " today" : undefined}
            lastMessage={t.currentQuestion}
            flag={t.urgentFlag ? <Badge tone="danger">Wellbeing</Badge> : t.flagCount > 0 ? <Badge tone="neutral">{plural(t.flagCount, "flag")}</Badge> : null}
          />
        ))}
        {!shown.length && <p className="type-body col-span-full text-fg-3">No students match.</p>}
      </div>
      {data.notStarted.length > 0 && <p className="type-caption text-fg-3">Not started yet: {data.notStarted.map((s) => s.studentName).join(", ")}</p>}

      <Card eyebrow="Flags" title="Moments worth a look">
        {data.flags.length ? (
          <ul className="m-0 flex list-none flex-col divide-y divide-[var(--border-1)] p-0">
            {data.flags.map((f) => (
              <li key={f.id} className="flex items-start gap-3 py-2.5">
                <Badge tone={f.kind === "wellbeing" ? "danger" : f.kind === "stuck" ? "stuck" : "neutral"} pulse={false}>{FLAG_LABEL[f.kind] ?? f.kind}</Badge>
                <div className="min-w-0 flex-1">
                  <a href={`/teacher/${classId}/students/${f.environmentId}`} className="type-label">{f.studentName}</a>
                  <p className="type-body m-0 text-fg-2">{f.detail}</p>
                  <p className="type-rule m-0 truncate text-xs text-fg-3">“{f.evidence}”</p>
                </div>
                <Button size="sm" variant="secondary" onClick={() => resolveFlag(f.id)}>Mark reviewed</Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="type-body text-fg-3">Nothing flagged.</p>
        )}
      </Card>
    </div>
  );
}

export function describeInput(input: unknown): string | undefined {
  if (!input || typeof input !== "object") return undefined;
  const i = input as Record<string, unknown>;
  if (typeof i.command === "string") return i.command;
  if (typeof i.file_path === "string") return typeof i.content === "string" ? `${i.file_path}\n${i.content.slice(0, 240)}` : i.file_path;
  return JSON.stringify(input, null, 2);
}
