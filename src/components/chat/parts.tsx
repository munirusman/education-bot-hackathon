"use client";
import type { ToolCallMessagePartProps } from "@assistant-ui/react";
import { MarkdownTextPrimitive } from "@assistant-ui/react-markdown";

/** Generative UI for tool calls: the same components render live, on replay and in the teacher view. */

const TOOL_LABEL: Record<string, string> = {
  read: "Read a file",
  write: "Wrote a file",
  edit: "Edited a file",
  bash: "Ran code",
  grep: "Searched files",
  glob: "Listed files",
  webSearch: "Searched the web",
};

const asText = (v: unknown) => (typeof v === "string" ? v : JSON.stringify(v, null, 2));

export function ToolCard({ toolName, args, result, isError, status }: ToolCallMessagePartProps) {
  const running = status?.type === "running";
  const input = args as Record<string, unknown> | undefined;
  const target = (input?.file_path ?? input?.command ?? input?.pattern) as string | undefined;
  const output = result && typeof result === "object" && "content" in (result as object) ? (result as { content: string }).content : result;
  return (
    <div className="my-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm" data-testid="tool-card">
      <div className="flex items-center gap-2 font-medium text-slate-700">
        <span>{TOOL_LABEL[toolName] ?? toolName}</span>
        {running && <span className="badge bg-amber-100 text-amber-800">working…</span>}
        {isError && <span className="badge bg-red-100 text-red-700">failed</span>}
      </div>
      {target && <pre className="mt-1 overflow-x-auto rounded bg-white p-2 font-mono text-xs text-slate-700">{target}</pre>}
      {output !== undefined && (
        <pre className={`mt-1 max-h-48 overflow-auto rounded p-2 font-mono text-xs ${isError ? "bg-red-50 text-red-700" : "bg-white text-slate-600"}`}>{asText(output)}</pre>
      )}
    </div>
  );
}

export function FileChangeCard({ data }: { name: string; data: unknown }) {
  const d = data as { change: string; path: string };
  return (
    <div className="my-2 inline-flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs text-emerald-800">
      <span className="font-semibold uppercase">{d.change}</span>
      <code>{d.path}</code>
    </div>
  );
}

export function ApprovalCard({ data }: { name: string; data: unknown }) {
  const d = data as { toolName?: string; state: "pending" | "approved" | "denied"; reason?: string };
  const style = { pending: "border-amber-300 bg-amber-50 text-amber-900", approved: "border-emerald-200 bg-emerald-50 text-emerald-800", denied: "border-red-200 bg-red-50 text-red-800" }[d.state];
  const text = {
    pending: `Waiting for your teacher to approve this ${d.toolName ?? "action"}…`,
    approved: "Your teacher approved this.",
    denied: `Your teacher did not approve this${d.reason ? `: ${d.reason}` : "."}`,
  }[d.state];
  return <div className={`my-2 rounded-md border px-3 py-2 text-sm ${style}`}>{text}</div>;
}

export function TeacherNoteCard({ data }: { name: string; data: unknown }) {
  const d = data as { text: string; teacherName: string };
  return (
    <div className="my-1 rounded-lg border-l-4 border-indigo-500 bg-indigo-50 px-3 py-2 text-sm text-indigo-950" data-testid="teacher-note">
      <div className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Teacher · {d.teacherName}</div>
      {d.text}
    </div>
  );
}

export function Reasoning({ text }: { text: string }) {
  return <details className="my-1 text-xs text-slate-500"><summary className="cursor-pointer">Thinking</summary><p className="whitespace-pre-wrap">{text}</p></details>;
}

export const partComponents = {
  Text: () => <MarkdownTextPrimitive className="prose prose-sm max-w-none whitespace-pre-wrap [&_p]:my-1" />,
  Reasoning: ({ text }: { text: string }) => <Reasoning text={text} />,
  tools: { Fallback: ToolCard },
  data: { by_name: { "file-change": FileChangeCard, approval: ApprovalCard, "teacher-note": TeacherNoteCard } },
};
