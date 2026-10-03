"use client";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { useChatRuntime } from "@assistant-ui/react-ai-sdk";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useMemo } from "react";
import { Thread } from "./Thread";

export function StudentChat({ environmentId, initialMessages, paused }: { environmentId: string; initialMessages: UIMessage[]; paused: boolean }) {
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        // The server owns history; send the environment id plus the latest messages only.
        prepareSendMessagesRequest: ({ messages }) => ({ body: { id: environmentId, messages: messages.slice(-1) } }),
      }),
    [environmentId],
  );
  const runtime = useChatRuntime({ id: environmentId, transport, messages: initialMessages });
  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {paused && <p className="mb-2 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-900">Your teacher has paused the tutor for now. You can read your history, but new questions will wait.</p>}
      <div className="h-[60vh]">
        <Thread emptyHint="Ask a question about your work. Your tutor will guide you step by step." />
      </div>
    </AssistantRuntimeProvider>
  );
}
