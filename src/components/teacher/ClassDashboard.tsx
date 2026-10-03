"use client";
import Link from "next/link";
import { useCallback, useState } from "react";
import type { Dashboard, Tile } from "@/lib/platform/dashboard";
import type { ApprovalRow, FlagRow } from "@/lib/db/repo";
import { useEventSource } from "./useLiveRefresh";

export type DashboardData = Dashboard & { flags: (FlagRow & { studentName: string })[]; approvals: (ApprovalRow & { studentName: string })[] };
type Filter = "all" | "stuck" | "flagged" | "idle" | "approval";

const FILTERS: { key: Filter; label: string; test: (t: Tile) => boolean }[] = [
  { key: "all", label: "All", test: () => true },
  { key: "stuck", label: "Stuck", test: (t) => t.stuck },
  { key: "flagged", label: "Flagged", test: (t) => t.flagCount > 0 },
  { key: "idle", label: "Idle", test: (t) => t.idle || t.status === "detached" },
  { key: "approval", label: "Needs approval", test: (t) => t.pendingApprovals > 0 },
];

const KIND_STYLE: Record<string, string> = {
  wellbeing: "bg-red-100 text-red-800",
  "answer-seeking": "bg-amber-100 text-amber-800",
  "instruction-bypass": "bg-orange-100 text-orange-800",
  "off-topic": "bg-slate-100 text-slate-700",
  stuck: "bg-violet-100 text-violet-800",
};

export function ClassDashboard({ classId, initial }: { classId: string; initial: DashboardData }) {
  const [data, setData] = useState(initial);
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<"name" | "recent">("name");

  const refresh = useCallback(async () => {
    const res = await fetch(`/api/teacher/classes/${classId}/dashboard`, { cache: "no-store" });
    if (res.ok) setData(await res.json());
  }, [classId]);
  useEventSource(`/api/teacher/classes/${classId}/stream`, refresh, 250);

  const test = FILTERS.find((f) => f.key === filter)!.test;
  const tiles = data.tiles
    .filter(test)
    .sort((a, b) => (sort === "name" ? a.studentName.localeCompare(b.studentName) : (b.lastActiveAt ?? "").localeCompare(a.lastActiveAt ?? "")));

  async function resolveFlag(id: string) {
    await fetch(`/api/teacher/flags/${id}`, { method: "DELETE" });
    refresh();
  }

  return (
    <div className="space-y-6">
      {data.flags.some((f) => f.kind === "wellbeing") && (
        <div role="alert" className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-900">
          <strong>Wellbeing concern:</strong> {data.flags.filter((f) => f.kind === "wellbeing").map((f) => f.studentName).join(", ")}. Please review now.
        </div>
      )}

      <section>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {FILTERS.map((f) => (
            <button key={f.key} className={`btn ${filter === f.key ? "btn-primary" : ""}`} onClick={() => setFilter(f.key)}>
              {f.label} ({data.tiles.filter(f.test).length})
            </button>
          ))}
          <select className="input ml-auto w-auto" value={sort} onChange={(e) => setSort(e.target.value as "name" | "recent")} aria-label="Sort">
            <option value="name">Sort: name</option>
            <option value="recent">Sort: most recent</option>
          </select>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tiles.map((t) => (
            <Link key={t.environmentId} href={`/teacher/${classId}/students/${t.environmentId}`} className={`card hover:border-indigo-400 ${t.urgentFlag ? "border-red-400" : ""}`} data-testid="student-tile">
              <div className="flex items-center justify-between">
                <span className="font-semibold">{t.studentName}</span>
                <span className={`badge ${t.status === "paused" ? "bg-amber-100 text-amber-800" : t.online ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>
                  {t.status === "paused" ? "paused" : t.online ? "online" : t.idle ? "idle" : t.status}
                </span>
              </div>
              <p className="mt-2 line-clamp-2 min-h-10 text-sm text-slate-600">{t.currentQuestion ?? <em className="text-slate-400">No questions yet</em>}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span>{t.turnsToday} turns today</span>
                {t.stuck && <span className={`badge ${KIND_STYLE.stuck}`}>stuck</span>}
                {t.flagCount > 0 && <span className="badge bg-red-100 text-red-800">{t.flagCount} flag{t.flagCount > 1 ? "s" : ""}</span>}
                {t.pendingApprovals > 0 && <span className="badge bg-amber-100 text-amber-800">approval needed</span>}
              </div>
            </Link>
          ))}
          {!tiles.length && <p className="text-sm text-slate-500">No students match this filter.</p>}
        </div>
        {data.notStarted.length > 0 && <p className="mt-3 text-xs text-slate-500">Not started yet: {data.notStarted.map((s) => s.studentName).join(", ")}</p>}
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="card lg:col-span-1">
          <h2 className="mb-2 font-semibold">Most-asked concepts this week</h2>
          {data.topics.length ? (
            <ul className="space-y-1 text-sm">
              {data.topics.map((t) => (
                <li key={t.term} className="flex items-center gap-2">
                  <span className="w-24 truncate">{t.term}</span>
                  <span className="h-2 rounded bg-indigo-400" style={{ width: `${Math.max(8, (t.count / data.topics[0]!.count) * 100)}px` }} />
                  <span className="text-xs text-slate-500">{t.count}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">Nothing yet.</p>
          )}
        </section>

        <section className="card lg:col-span-2">
          <h2 className="mb-2 font-semibold">Flag inbox</h2>
          {data.flags.length ? (
            <ul className="divide-y divide-slate-100 text-sm">
              {data.flags.map((f) => (
                <li key={f.id} className="flex items-start gap-3 py-2">
                  <span className={`badge shrink-0 ${KIND_STYLE[f.kind] ?? ""}`}>{f.kind}</span>
                  <div className="min-w-0 flex-1">
                    <Link href={`/teacher/${classId}/students/${f.environmentId}`} className="font-medium hover:underline">{f.studentName}</Link>
                    <p className="text-slate-600">{f.detail}</p>
                    <p className="truncate text-xs italic text-slate-400">"{f.evidence}"</p>
                  </div>
                  <button className="btn" onClick={() => resolveFlag(f.id)}>Resolve</button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">No open flags.</p>
          )}
        </section>
      </div>

      {data.approvals.length > 0 && (
        <section className="card">
          <h2 className="mb-2 font-semibold">Waiting for your approval</h2>
          <ul className="space-y-2 text-sm">
            {data.approvals.map((a) => (
              <li key={a.id} className="flex items-center gap-3">
                <span><strong>{a.studentName}</strong> wants to use <code>{a.toolName}</code></span>
                <Link className="btn ml-auto" href={`/teacher/${classId}/students/${a.environmentId}`}>Review</Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
