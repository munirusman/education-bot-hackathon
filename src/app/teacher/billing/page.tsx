import Link from "next/link";
import { notFound } from "next/navigation";
import { chargebeeConfig } from "@/lib/billing/chargebee";
import { activeSubscription, teacherUpgradeMessage, usageStatus } from "@/lib/billing/limit";
import { MAX_EVENT_AGE_MS, monthRange, summarizeUsage } from "@/lib/billing/meter";
import { estimateCharge, formatMoney, rateCard } from "@/lib/billing/pricing";
import { pageTeacher } from "@/lib/platform/identity";
import { getServices } from "@/lib/platform/services";
import { Badge, Card, cx } from "@/components/orbit/core";
import { SyncUsageButton } from "@/components/teacher/SyncUsageButton";
import { UpgradeButton } from "@/components/teacher/UpgradeButton";
import { TeacherShell, TopBar } from "@/components/teacher/TeacherShell";

export const dynamic = "force-dynamic";

const nf = new Intl.NumberFormat("en-US");
const SYNC_TONE = { sent: "working", pending: "approval", failed: "danger", expired: "paused" } as const;
const SYNC_LABEL = { sent: "Sent", pending: "Waiting", failed: "Refused", expired: "Too old" } as const;

function monthOptions(now = new Date()) {
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    return { key: `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`, label: d.toLocaleString("en-US", { month: "long", year: "numeric", timeZone: "UTC" }) };
  });
}

export default async function BillingPage({ searchParams }: { searchParams: Promise<{ month?: string }> }) {
  const { month } = await searchParams;
  const teacher = await pageTeacher();
  const { repo } = await getServices();
  const range = monthRange(month);
  if (month && month !== range.key) notFound();

  const classes = await repo.listClassesForTeacher(teacher.id);
  const students = await repo.listUsers("student");
  const rows = await repo.usageBetween(teacher.id, range.from, range.to);
  const card = rateCard();
  const sum = summarizeUsage(rows, { classes: new Map(classes.map((c) => [c.id, c.name])), students: new Map(students.map((s) => [s.id, s.name])) }, card);
  const plan = await usageStatus(repo, teacher.id);
  const cb = chargebeeConfig();
  const activeSub = await activeSubscription(repo, teacher.id, cb);
  const canUpgrade = Boolean(cb?.upgradeSubscriptionId && activeSub !== cb.upgradeSubscriptionId);
  const upgraded = Boolean(cb?.upgradeSubscriptionId && activeSub === cb.upgradeSubscriptionId);
  const counts = await repo.usageSyncCounts(teacher.id);
  const maxDay = Math.max(1, ...sum.byDay.map((d) => d.tokens));
  const money = (n: number) => formatMoney(n, card.currency);
  const months = monthOptions();
  const monthLabel = range.from.toLocaleString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });

  return (
    <TeacherShell teacher={teacher.name} classes={classes}>
      <TopBar title="Usage and billing">
        <nav className="ml-auto flex gap-1" aria-label="Month">
          {months.slice(0, 3).map((m) => (
            <Link key={m.key} href={`/teacher/billing?month=${m.key}`} className={cx("rounded-sm px-2.5 py-1 type-label no-underline", m.key === range.key ? "bg-plum-50 text-plum-700" : "text-fg-2 hover:bg-sand-100")}>
              {m.label}
            </Link>
          ))}
        </nav>
      </TopBar>

      <div className="min-h-0 flex-1 overflow-auto p-7">
        <div className="mx-auto flex max-w-5xl flex-col gap-5">
          <p className="type-body m-0 text-fg-2">You’re billed by how much your students use their tutors. Here’s {monthLabel} so far (UTC).</p>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              ["Questions", nf.format(sum.totals.questions)],
              ["Tokens in", nf.format(sum.totals.inputTokens)],
              ["Tokens out", nf.format(sum.totals.outputTokens)],
              ["Estimated charge", money(sum.totals.charge)],
            ].map(([label, value]) => (
              <Card key={label} padding="p-3.5">
                <div className="type-eyebrow text-fg-3">{label}</div>
                <div className="font-serif text-4xl leading-none text-fg-1" data-testid={`stat-${label}`}>{value}</div>
              </Card>
            ))}
          </div>
          <p className="type-caption m-0 -mt-2 text-fg-3">
            Estimate at {money(card.perMillionInput)} per million input tokens and {money(card.perMillionOutput)} per million output tokens. Your Chargebee invoice is what you’re actually charged.
            {sum.totals.estimatedTokens > 0 && ` ${nf.format(sum.totals.estimatedTokens)} of these tokens are estimated because the tutor didn’t report exact counts.`}
          </p>

          {cb && plan.allowanceState === "unavailable" && (
            <Card eyebrow="Plan" title="Monthly token allowance">
              <p className="type-body m-0 text-fg-2">Couldn’t read your allowance from Chargebee, so students aren’t being limited right now. Check the connection and reload.</p>
            </Card>
          )}
          {plan.limit !== null && (
            <Card eyebrow="Plan" title="Monthly token allowance" actions={canUpgrade ? <UpgradeButton label={plan.exceeded ? "Upgrade to keep going" : "Upgrade"} /> : upgraded ? <Badge tone="working" dot pulse={false}>Upgraded plan</Badge> : undefined}>
              <div className="flex items-baseline justify-between">
                <span className="type-body text-fg-1" data-testid="plan-usage">{nf.format(plan.used)} of {nf.format(plan.limit)} tokens used this month</span>
                <Badge tone={plan.exceeded ? "danger" : plan.used / plan.limit >= 0.8 ? "approval" : "working"}>{plan.exceeded ? "Limit reached" : `${nf.format(Math.max(0, plan.limit - plan.used))} left`}</Badge>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-sand-200" role="img" aria-label="Token allowance used">
                <div className={cx("h-full", plan.exceeded ? "bg-red-500" : "bg-plum-500")} style={{ width: `${Math.min(100, (plan.used / plan.limit) * 100)}%` }} />
              </div>
              {plan.exceeded ? (
                <p className="type-body m-0 text-fg-1" data-testid="upgrade-note">{teacherUpgradeMessage(plan.limit)}</p>
              ) : (
                <p className="type-caption m-0 text-fg-3">The allowance comes from your Chargebee plan. Students can ask questions until it runs out. The question that crosses the limit finishes; after that the tutors pause.</p>
              )}
            </Card>
          )}

          <Card eyebrow="Billing" title="Chargebee" actions={<SyncUsageButton disabled={!cb} />}>
            {cb ? (
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="working" dot pulse={false}>Connected</Badge>
                <span className="type-caption text-fg-2">Site <span className="font-mono">{cb.site}</span> · subscription <span className="font-mono">{activeSub}</span></span>
                {(counts.pending ?? 0) > 0 && <Badge tone="approval">{counts.pending} waiting to send</Badge>}
                {(counts.failed ?? 0) > 0 && <Badge tone="danger">{counts.failed} refused</Badge>}
                {(counts.expired ?? 0) > 0 && <Badge tone="paused">{counts.expired} too old to send</Badge>}
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                <div><Badge tone="paused" dot pulse={false}>Not connected</Badge></div>
                <p className="type-body m-0 text-fg-2">Usage is being recorded here, but nothing is sent for billing yet. Set <span className="font-mono text-[13px]">CHARGEBEE_SITE</span>, <span className="font-mono text-[13px]">CHARGEBEE_API_KEY</span> and <span className="font-mono text-[13px]">CHARGEBEE_SUBSCRIPTION_ID</span> to connect. Usage older than {Math.floor(MAX_EVENT_AGE_MS / 3_600_000)} hours can’t be sent afterwards.</p>
              </div>
            )}
            <p className="type-caption m-0 text-fg-3">Only counts, the model name and the class id are sent. Student names and questions never leave this app for billing.</p>
          </Card>

          <Card eyebrow="Daily" title="Tokens per day">
            {sum.byDay.length ? (
              <div className="flex h-32 items-end gap-1" role="img" aria-label="Tokens per day">
                {sum.byDay.map((d) => (
                  <div key={d.day} className="group flex min-w-0 flex-1 flex-col items-center justify-end gap-1" title={`${d.day}: ${nf.format(d.tokens)} tokens, ${d.questions} questions`}>
                    <div className="w-full rounded-t-xs bg-plum-400" style={{ height: `${Math.max(4, (d.tokens / maxDay) * 100)}%` }} />
                    <span className="font-mono text-[10px] text-fg-3">{d.day.slice(8)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="type-body m-0 text-fg-3">No usage in {monthLabel}.</p>
            )}
          </Card>

          <div className="grid gap-5 lg:grid-cols-2">
            <Card eyebrow="By class" title="Where it’s used">
              <Table head={["Class", "Questions", "Tokens", "Estimate"]} rows={sum.byClass.map((c) => [c.name, nf.format(c.questions), nf.format(c.tokens), money(c.charge)])} empty="No usage yet." />
            </Card>
            <Card eyebrow="By student" title="Who’s using it most">
              <Table head={["Student", "Questions", "Tokens"]} rows={sum.byStudent.slice(0, 10).map((s) => [s.name, nf.format(s.questions), nf.format(s.tokens)])} empty="No usage yet." />
            </Card>
          </div>

          <Card eyebrow="By model" title="Models">
            <Table head={["Model", "Questions", "Tokens"]} rows={sum.byModel.map((m) => [<span key={m.model} className="font-mono text-[13px]">{m.model}</span>, nf.format(m.questions), nf.format(m.tokens)])} empty="No usage yet." />
          </Card>

          <Card eyebrow="Latest" title="Recent usage records">
            {rows.length ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left type-body">
                  <thead><tr className="type-caption text-fg-3"><th className="py-1.5 pr-3 font-medium">When (UTC)</th><th className="pr-3 font-medium">Class</th><th className="pr-3 text-right font-medium">Tokens</th><th className="pr-3 font-medium">Counts</th><th className="font-medium">Chargebee</th></tr></thead>
                  <tbody>
                    {rows.slice(0, 15).map((r) => (
                      <tr key={r.id} className="border-t border-line">
                        <td className="py-2 pr-3 font-mono text-xs">{r.usageAt.slice(0, 16).replace("T", " ")}</td>
                        <td className="pr-3">{classes.find((c) => c.id === r.classId)?.name ?? "Deleted class"}</td>
                        <td className="pr-3 text-right font-mono text-xs">{nf.format(r.inputTokens + r.outputTokens)}</td>
                        <td className="pr-3 type-caption text-fg-3">{r.tokenSource === "provider" ? "Exact" : "Estimated"}</td>
                        <td title={r.syncError ?? undefined}>{cb || r.syncStatus !== "pending" ? <Badge tone={SYNC_TONE[r.syncStatus]} pulse={false}>{SYNC_LABEL[r.syncStatus]}</Badge> : <span className="type-caption text-fg-3">Not connected</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="type-body m-0 text-fg-3">Nothing recorded yet. Each question a student asks adds a record.</p>
            )}
            <p className="type-caption m-0 text-fg-3">Estimated charge for this list: {money(rows.slice(0, 15).reduce((n, r) => n + estimateCharge(r, card), 0))}</p>
          </Card>
        </div>
      </div>
    </TeacherShell>
  );
}

function Table({ head, rows, empty }: { head: string[]; rows: React.ReactNode[][]; empty: string }) {
  if (!rows.length) return <p className="type-body m-0 text-fg-3">{empty}</p>;
  return (
    <table className="w-full text-left type-body">
      <thead><tr className="type-caption text-fg-3">{head.map((h, i) => <th key={h} className={cx("py-1.5 font-medium", i > 0 && "text-right")}>{h}</th>)}</tr></thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className="border-t border-line">
            {r.map((c, j) => <td key={j} className={cx("py-2", j > 0 && "text-right font-mono text-xs")}>{c}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
