/** Server-sent events over a pub/sub topic, with heartbeats and clean unsubscribe. */
export function sseResponse(
  subscribe: (send: (data: unknown) => void) => () => void,
  signal: AbortSignal,
): Response {
  const enc = new TextEncoder();
  let cleanup = () => {};
  const stream = new ReadableStream({
    start(controller) {
      const write = (s: string) => {
        try {
          controller.enqueue(enc.encode(s));
        } catch {
          cleanup();
        }
      };
      const unsub = subscribe((data) => write(`data: ${JSON.stringify(data)}\n\n`));
      const beat = setInterval(() => write(`: ping\n\n`), 15_000);
      cleanup = () => {
        clearInterval(beat);
        unsub();
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      };
      signal.addEventListener("abort", cleanup);
      write(`: connected\n\n`);
    },
    cancel() {
      cleanup();
    },
  });
  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache, no-transform", Connection: "keep-alive" },
  });
}
