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
        // The server owns history; send the environment id plus the latest message only.
        prepareSendMessagesRequest: ({ messages }) => ({ body: { id: environmentId, messages: messages.slice(-1) } }),
      }),
    [environmentId],
  );
  const runtime = useChatRuntime({ id: environmentId, transport, messages: initialMessages });
  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <Thread paused={paused} emptyHint="Ask about anything you’re working on. Your tutor will help you think it through." />
    </AssistantRuntimeProvider>
  );
}
