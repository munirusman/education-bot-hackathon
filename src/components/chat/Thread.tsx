"use client";
import { ComposerPrimitive, MessagePrimitive, ThreadPrimitive, useAuiState } from "@assistant-ui/react";
import { ArrowUp, Sparkle, Square } from "lucide-react";
import { createContext, useContext } from "react";
import { cx } from "../orbit/core";
import { assistantParts } from "./parts";

/** Who is reading the thread changes only the student's label ("You" vs their name). */
const StudentLabel = createContext("You");

function UserMessage() {
  const label = useContext(StudentLabel);
  return (
    <MessagePrimitive.Root className="flex flex-col items-end gap-1">
      <span className="type-caption font-medium text-fg-2">{label}</span>
      <div className="max-w-[82%] whitespace-pre-wrap rounded-[14px_14px_4px_14px] bg-plum-600 px-[13px] py-[9px] text-sm text-white">
        <MessagePrimitive.Parts />
      </div>
    </MessagePrimitive.Root>
  );
}

function AssistantMessage() {
  const isNote = useAuiState((s) => s.message.content.length > 0 && s.message.content.every((p) => p.type === "data" && (p as { name?: string }).name === "teacher-note"));
  const thinking = useAuiState((s) => s.message.status?.type === "running" && s.message.content.length === 0);
  if (isNote)
    return (
      <MessagePrimitive.Root>
        <MessagePrimitive.Parts components={assistantParts} />
      </MessagePrimitive.Root>
    );
  return (
    <MessagePrimitive.Root className="flex flex-col items-start gap-1">
      <span className="type-caption flex items-center gap-1.5 text-fg-3">
        <span className="grid size-4 place-items-center rounded-full bg-plum-600"><Sparkle size={10} color="#fff" aria-hidden /></span>
        <span className="font-medium text-fg-2">Tutor</span>
      </span>
      <div className="w-full max-w-[82%] py-0.5">
        {thinking ? (
          <span className="type-caption flex items-center gap-1.5 text-fg-3"><Sparkle size={12} className="text-plum-500" aria-hidden />Tutor is thinking…</span>
        ) : (
          <MessagePrimitive.Parts components={assistantParts} />
        )}
        <MessagePrimitive.Error>
          <p className="type-caption mt-1 text-danger-ink">That didn’t send. Try again in a moment.</p>
        </MessagePrimitive.Error>
      </div>
    </MessagePrimitive.Root>
  );
}

export function Thread({ readOnly = false, studentLabel = "You", emptyHint, paused = false, compact = false, notice }: { readOnly?: boolean; studentLabel?: string; emptyHint?: string; paused?: boolean; compact?: boolean; notice?: string }) {
  return (
    <StudentLabel.Provider value={studentLabel}>
      <ThreadPrimitive.Root className="flex h-full min-h-0 flex-col">
        <ThreadPrimitive.Viewport className="min-h-0 flex-1 overflow-y-auto">
          <div className={cx("mx-auto flex flex-col gap-[18px]", compact ? "p-[18px]" : "max-w-[720px] px-7 pt-7 pb-3")}>
            <ThreadPrimitive.Empty>
              <p className="type-body py-10 text-center text-fg-3">{emptyHint ?? "Nothing here yet."}</p>
            </ThreadPrimitive.Empty>
            <ThreadPrimitive.Messages components={{ UserMessage, AssistantMessage }} />
            {notice && (
              <p role="alert" className="type-body rounded-md border border-line-2 bg-sun-50 px-4 py-3 text-center text-fg-1">{notice}</p>
            )}
            {paused && (
              <p className="type-caption text-center text-fg-3">{readOnly ? "You paused this tutor." : "Your teacher paused the tutor."}</p>
            )}
          </div>
        </ThreadPrimitive.Viewport>
        {!readOnly && (
          <div className="mx-auto w-full max-w-[720px] px-7 pb-6">
            <ComposerPrimitive.Root className={cx("flex items-end gap-2 rounded-lg border border-line-2 p-2 shadow-sm", paused || notice ? "bg-sand-100" : "bg-card")}>
              <ComposerPrimitive.Input
                rows={1}
                autoFocus
                disabled={paused || Boolean(notice)}
                placeholder={paused ? "Your teacher paused the tutor." : notice ? "The tutor is unavailable right now." : "Ask your tutor…"}
                aria-label="Message your tutor"
                className="max-h-40 min-w-0 flex-1 resize-none border-0 bg-transparent px-1 py-2 text-[15px] text-fg-1 outline-none placeholder:text-fg-3 focus:shadow-none"
              />
              <ThreadPrimitive.If running={false}>
                <ComposerPrimitive.Send aria-label="Send" title="Send" disabled={paused || Boolean(notice)} className="inline-grid size-9 cursor-pointer place-items-center rounded-sm bg-accent text-white hover:bg-accent-hover active:translate-y-px disabled:cursor-not-allowed disabled:opacity-45">
                  <ArrowUp size={16} aria-hidden />
                </ComposerPrimitive.Send>
              </ThreadPrimitive.If>
              <ThreadPrimitive.If running>
                <ComposerPrimitive.Cancel aria-label="Stop" title="Stop" className="inline-grid size-9 cursor-pointer place-items-center rounded-sm border border-line-2 bg-card text-fg-2 hover:bg-sand-50">
                  <Square size={14} aria-hidden />
                </ComposerPrimitive.Cancel>
              </ThreadPrimitive.If>
            </ComposerPrimitive.Root>
            <p className="type-caption mt-2 text-center text-fg-3">Your tutor helps you think it through. It won’t do the work for you.</p>
          </div>
        )}
      </ThreadPrimitive.Root>
    </StudentLabel.Provider>
  );
}
