/** Orbit product primitives, ported from "Orbit Design System/components/orbit". */
"use client";
import Link from "next/link";
import { Check, MessageCircleQuestion, Shield, Timer, Users, X, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Avatar, Badge, Button, cx } from "./core";

export type SessionState = "working" | "stuck" | "approval" | "paused" | "offline";
export const STATE_LABEL: Record<SessionState, string> = { working: "Working", stuck: "Stuck", approval: "Needs approval", paused: "Paused", offline: "Offline" };

export function StateBadge({ state }: { state: SessionState }) {
  return <Badge tone={state === "offline" ? "neutral" : state} dot>{STATE_LABEL[state]}</Badge>;
}

export function StudentTile({ href, name, state, meta, topic, lastMessage, flag, selected }: { href: string; name: string; state: SessionState; meta?: string; topic?: ReactNode; lastMessage?: string | null; flag?: ReactNode; selected?: boolean }) {
  const offline = state === "offline";
  return (
    <Link
      href={href}
      scroll={false}
      data-testid="student-tile"
      className={cx(
        "flex min-w-0 flex-col gap-2.5 rounded-md border p-3.5 text-inherit no-underline transition-shadow duration-[var(--dur-base)] ease-[var(--ease-orbit)]",
        offline ? "bg-sand-50" : "bg-card",
        selected ? "border-plum-500 shadow-[0_0_0_1px_var(--plum-500)]" : "border-line shadow-xs hover:shadow-md",
      )}
    >
      <div className="flex items-center gap-2">
        <Avatar name={name} size={28} />
        <span className={cx("type-h3 min-w-0 flex-1 truncate text-sm", offline ? "text-fg-3" : "text-fg-1")}>{name}</span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <StateBadge state={state} />
        {flag}
        {meta && <span className="font-mono text-[11px] leading-none text-fg-3">{meta}</span>}
      </div>
      {topic && <div className="type-caption text-fg-2">{topic}</div>}
      {lastMessage && <div className="line-clamp-2 text-[13px] text-fg-1">“{lastMessage}”</div>}
    </Link>
  );
}

const RULE_ICON: Record<string, LucideIcon> = { behavior: MessageCircleQuestion, permission: Shield, mode: Timer };

/** A rule as written, quoted verbatim in mono. */
export function RuleCard({ rule, scope = "All students", kind = "behavior", trailing }: { rule: ReactNode; scope?: ReactNode; kind?: "behavior" | "permission" | "mode"; trailing?: ReactNode }) {
  const I = RULE_ICON[kind] ?? MessageCircleQuestion;
  return (
    <div className="flex items-start gap-3 rounded-md border border-line bg-card px-4 py-3.5">
      <span className="grid size-7 flex-none place-items-center rounded-sm bg-plum-50"><I size={15} className="text-plum-600" aria-hidden /></span>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="type-rule text-fg-1">{rule}</div>
        <div className="type-caption flex items-center gap-1.5 text-fg-3"><Users size={12} aria-hidden />{scope}</div>
      </div>
      {trailing}
    </div>
  );
}

export function ActionRequest({ student, action, detail, state = "pending", busy, onApprove, onDeny }: { student?: string; action: string; detail?: string; state?: "pending" | "approved" | "denied"; busy?: boolean; onApprove?: () => void; onDeny?: () => void }) {
  return (
    <div className={cx("flex flex-col gap-2.5 rounded-md border bg-card p-3.5", state === "pending" ? "border-[var(--blue-500)]" : "border-line")}>
      <div className="flex items-center gap-2">
        {student && <Avatar name={student} size={22} />}
        <span className="type-label text-fg-1">{student ? `${student}’s tutor` : "The tutor"} wants to {action}</span>
      </div>
      {detail && <div className="type-rule whitespace-pre-wrap rounded-sm bg-sunken px-2.5 py-2 text-xs text-fg-1">{detail}</div>}
      {state === "pending" ? (
        <div className="flex gap-2">
          <Button size="sm" icon={Check} onClick={onApprove} disabled={busy}>Approve</Button>
          <Button size="sm" variant="secondary" onClick={onDeny} disabled={busy}>Deny</Button>
        </div>
      ) : (
        <div className={cx("type-caption flex items-center gap-1.5", state === "approved" ? "text-working-ink" : "text-danger-ink")}>
          {state === "approved" ? <Check size={13} aria-hidden /> : <X size={13} aria-hidden />}
          {state === "approved" ? "Approved" : "Denied"}
        </div>
      )}
    </div>
  );
}
