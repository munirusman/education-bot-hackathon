"use client";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { useAISDKRuntime } from "@assistant-ui/react-ai-sdk";
import { Chat, useChat } from "@ai-sdk/react";
import { useMemo, useRef } from "react";
import type { HarnessEvent } from "@/lib/contracts";
import { buildMessages } from "@/lib/projection";
import { Thread } from "../chat/Thread";
import { useEventSource } from "./useLiveRefresh";

type E = HarnessEvent & { turnId?: string };
const key = (e: E) => `${e.type}:${e.seq}:${e.at}`;

/**
 * The same assistant-ui Thread the student sees, read-only, rendered from the
 * same event projection. Live events from the mirror topic are folded in as
 * they arrive, so tokens appear in real time.
 */
export function TeacherThread({ environmentId, initialEvents, studentName, paused }: { environmentId: string; initialEvents: E[]; studentName: string; paused: boolean }) {
  const events = useRef<E[]>(initialEvents);
  const seen = useRef(new Set(initialEvents.map(key)));
  // A refreshed server snapshot replaces the local fold.
  const chat = useMemo(() => {
    events.current = [...initialEvents];
    seen.current = new Set(initialEvents.map(key));
    return new Chat({ messages: buildMessages(initialEvents) });
  }, [initialEvents]);
  const helpers = useChat({ chat });
  const runtime = useAISDKRuntime(helpers);

  useEventSource(`/api/teacher/environments/${environmentId}/stream`, (ev: E) => {
    if (!ev || ev.type === "status" || ev.type === "flag") return;
    const k = key(ev);
    if (seen.current.has(k)) return;
    seen.current.add(k);
    events.current.push(ev);
    chat.messages = buildMessages(events.current);
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <Thread readOnly compact paused={paused} studentLabel={studentName} emptyHint={`${studentName} hasn’t asked anything yet.`} />
    </AssistantRuntimeProvider>
  );
}
