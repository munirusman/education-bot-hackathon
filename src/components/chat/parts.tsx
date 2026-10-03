"use client";
import type { ToolCallMessagePartProps } from "@assistant-ui/react";
import { MarkdownTextPrimitive } from "@assistant-ui/react-markdown";
import { Check, Clock, FilePen, FileText, Globe, Search, ShieldCheck, Terminal, X, type LucideIcon } from "lucide-react";
import { Avatar, cx } from "../orbit/core";

/**
 * Generative UI for tool calls and app data parts. The same components render
 * live, on reload, and in the teacher's read-only view, in Orbit's chat style.
 */

const TOOL: Record<string, [LucideIcon, string]> = {
  read: [FileText, "Read a file"],
  write: [FilePen, "Wrote a file"],
  edit: [FilePen, "Edited a file"],
  bash: [Terminal, "Ran code"],
  grep: [Search, "Searched your files"],
  glob: [Search, "Listed your files"],
  webSearch: [Globe, "Searched the web"],
};

const asText = (v: unknown) => (typeof v === "string" ? v : JSON.stringify(v, null, 2));

export function ToolCard({ toolName, args, result, isError, status }: ToolCallMessagePartProps) {
  const [I, label] = TOOL[toolName] ?? [Terminal, toolName];
  const running = status?.type === "running";
  const input = args as Record<string, unknown> | undefined;
  const target = (input?.file_path ?? input?.command ?? input?.pattern) as string | undefined;
  const output = result && typeof result === "object" && "content" in (result as object) ? (result as { content: string }).content : result;
  return (
    <details className="group my-2 rounded-sm border border-line bg-card" data-testid="tool-card">
      <summary className="flex cursor-pointer list-none items-center gap-2 px-2.5 py-2 type-caption text-fg-2 [&::-webkit-details-marker]:hidden">
        <I size={14} aria-hidden />
        <span className="font-medium text-fg-1">{label}</span>
        {target && <span className="min-w-0 truncate font-mono text-[12px] text-fg-2">{target.split("\n")[0]}</span>}
        <span className="ml-auto">{running ? "Working…" : isError ? <span className="text-danger-ink">Failed</span> : null}</span>
      </summary>
      {output !== undefined && (
        <pre className={cx("type-rule mx-2.5 mb-2.5 max-h-48 overflow-auto whitespace-pre-wrap rounded-sm px-2.5 py-2 text-xs", isError ? "bg-danger-bg text-danger-ink" : "bg-sunken text-fg-1")}>{asText(output)}</pre>
      )}
    </details>
  );
}

export function FileChangeCard({ data }: { name: string; data: unknown }) {
  const d = data as { change: string; path: string };
  const verb = d.change === "create" ? "Created" : d.change === "delete" ? "Deleted" : "Updated";
  return (
    <div className="my-1.5 inline-flex items-center gap-1.5 type-caption text-fg-2">
      <FilePen size={13} aria-hidden />
      {verb} <span className="font-mono text-[12px] text-fg-1">{d.path}</span>
    </div>
  );
}

export function ApprovalCard({ data }: { name: string; data: unknown }) {
  const d = data as { toolName?: string; state: "pending" | "approved" | "denied"; reason?: string };
  if (d.state === "pending")
    return (
      <div className="my-2 flex items-center gap-2 rounded-sm bg-approval-bg px-3 py-2 type-caption text-approval-ink">
        <Clock size={14} aria-hidden />
        Waiting for your teacher to approve this{d.toolName ? ` (${d.toolName})` : ""}.
      </div>
    );
  return (
    <div className={cx("my-1.5 flex items-center gap-1.5 type-caption", d.state === "approved" ? "text-working-ink" : "text-danger-ink")}>
      {d.state === "approved" ? <Check size={13} aria-hidden /> : <X size={13} aria-hidden />}
      {d.state === "approved" ? "Your teacher approved this." : `Your teacher said not now${d.reason && d.reason !== "Not right now" ? `: ${d.reason}` : "."}`}
    </div>
  );
}

export function TeacherNoteCard({ data }: { name: string; data: unknown }) {
  const d = data as { text: string; teacherName: string };
  return (
    <div className="flex gap-2.5 rounded-md bg-teacher px-3.5 py-3" data-testid="teacher-note">
      <Avatar name={d.teacherName} teacher size={26} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="type-label text-sun-700">{d.teacherName}</span>
          <span className="type-eyebrow text-sun-700">Teacher</span>
        </div>
        <div className="type-body mt-[3px] whitespace-pre-wrap text-fg-1">{d.text}</div>
      </div>
    </div>
  );
}

export function RuleFootnote({ data }: { name: string; data: unknown }) {
  return (
    <div className="mt-1 inline-flex items-center gap-[5px] font-mono text-[11px] leading-[1.3] text-fg-3">
      <ShieldCheck size={12} aria-hidden />
      {(data as { text: string }).text}
    </div>
  );
}

export function Reasoning({ text }: { text: string }) {
  return (
    <details className="my-1 type-caption text-fg-3">
      <summary className="cursor-pointer">Thinking</summary>
      <p className="whitespace-pre-wrap">{text}</p>
    </details>
  );
}

export const assistantParts = {
  Text: () => <MarkdownTextPrimitive className="tutor-prose" />,
  Reasoning: ({ text }: { text: string }) => <Reasoning text={text} />,
  tools: { Fallback: ToolCard },
  data: { by_name: { "file-change": FileChangeCard, approval: ApprovalCard, "teacher-note": TeacherNoteCard, rule: RuleFootnote } },
};
