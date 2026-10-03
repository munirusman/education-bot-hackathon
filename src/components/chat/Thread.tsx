"use client";
import { ComposerPrimitive, MessagePrimitive, ThreadPrimitive, useAuiState } from "@assistant-ui/react";
import { partComponents } from "./parts";

function UserMessage() {
  return (
    <MessagePrimitive.Root className="my-3 flex justify-end">
      <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-indigo-600 px-4 py-2 text-sm text-white">
        <MessagePrimitive.Parts />
      </div>
    </MessagePrimitive.Root>
  );
}

function AssistantMessage() {
  const isNote = useAuiState((s) => s.message.content.length > 0 && s.message.content.every((p) => p.type === "data" && (p as { name?: string }).name === "teacher-note"));
  return (
    <MessagePrimitive.Root className="my-3 flex justify-start">
      <div className={isNote ? "max-w-[85%]" : "max-w-[85%] rounded-2xl rounded-bl-sm border border-slate-200 bg-white px-4 py-2 text-sm"}>
        <MessagePrimitive.Parts components={partComponents} />
        <MessagePrimitive.Error>
          <p className="text-sm text-red-600">Something went wrong sending that. Please try again.</p>
        </MessagePrimitive.Error>
      </div>
    </MessagePrimitive.Root>
  );
}

export function Thread({ readOnly = false, emptyHint }: { readOnly?: boolean; emptyHint?: string }) {
  return (
    <ThreadPrimitive.Root className="flex h-full flex-col">
      <ThreadPrimitive.Viewport className="flex-1 overflow-y-auto px-2">
        <ThreadPrimitive.Empty>
          <p className="py-10 text-center text-sm text-slate-500">{emptyHint ?? "Nothing here yet."}</p>
        </ThreadPrimitive.Empty>
        <ThreadPrimitive.Messages components={{ UserMessage, AssistantMessage }} />
      </ThreadPrimitive.Viewport>
      {!readOnly && (
        <ComposerPrimitive.Root className="mt-2 flex items-end gap-2 border-t border-slate-200 pt-3">
          <ComposerPrimitive.Input
            rows={1}
            autoFocus
            placeholder="Ask your tutor a question…"
            className="input max-h-40 resize-none"
            aria-label="Message"
          />
          <ThreadPrimitive.If running={false}>
            <ComposerPrimitive.Send className="btn btn-primary">Send</ComposerPrimitive.Send>
          </ThreadPrimitive.If>
          <ThreadPrimitive.If running>
            <ComposerPrimitive.Cancel className="btn">Stop</ComposerPrimitive.Cancel>
          </ThreadPrimitive.If>
        </ComposerPrimitive.Root>
      )}
    </ThreadPrimitive.Root>
  );
}
