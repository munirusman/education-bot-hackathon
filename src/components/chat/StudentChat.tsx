"use client";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { useChatRuntime } from "@assistant-ui/react-ai-sdk";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useMemo, useState } from "react";
import { Thread } from "./Thread";

export function StudentChat({ environmentId, initialMessages, paused, blockedNotice }: { environmentId: string; initialMessages: UIMessage[]; paused: boolean; blockedNotice?: string }) {
  const [notice, setNotice] = useState(blockedNotice);
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        // 402 means the teacher's plan is out of tokens: show why and stop accepting questions.
        fetch: async (input, init) => {
          const res = await fetch(input, init);
          if (res.status === 402) setNotice(await res.clone().text());
          return res;
        },
        // The server owns history; send the environment id plus the latest message only.
        prepareSendMessagesRequest: ({ messages }) => ({ body: { id: environmentId, messages: messages.slice(-1) } }),
      }),
    [environmentId],
  );
  const runtime = useChatRuntime({ id: environmentId, transport, messages: initialMessages });
  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <Thread paused={paused} notice={notice} emptyHint="Ask about anything you’re working on. Your tutor will help you think it through." />
    </AssistantRuntimeProvider>
  );
}
