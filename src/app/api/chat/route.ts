import { createUIMessageStream, createUIMessageStreamResponse } from "ai";
import { chatRequestSchema, type HarnessEvent } from "@/lib/contracts";
import { errorResponse, requireStudentOf } from "@/lib/platform/identity";
import { getServices } from "@/lib/platform/services";
import { resolveEffectivePolicy } from "@/lib/platform/policy";
import { createChunkProjector } from "@/lib/projection";

export const maxDuration = 300;

function promptOf(messages: { role: string; parts?: unknown[] }[]): string {
  const last = [...messages].reverse().find((m) => m.role === "user");
  return (last?.parts ?? [])
    .map((p) => ((p as { type?: string; text?: string }).type === "text" ? (p as { text: string }).text : ""))
    .join("")
    .trim();
}

/**
 * One student turn. The harness session owns history, so only the latest user
 * message is read. Ownership of the environment is checked on every request and
 * the policy is loaded here, on the server, never taken from the request.
 */
export async function POST(req: Request) {
  try {
    const body = chatRequestSchema.parse(await req.json());
    const { env } = await requireStudentOf(body.id);
    const prompt = promptOf(body.messages as never);
    if (!prompt) return new Response("Please type a question.", { status: 400 });
    if (prompt.length > 4000) return new Response("That message is too long. Try a shorter question.", { status: 400 });

    const { repo, env: envService, broker } = await getServices();
    await envService.resume(env.id);
    const cls = (await repo.getClass(env.classId))!;
    const notes = await repo.pendingTeacherNotes(env.id);

    const iterator = envService
      .runTurn({
        environmentId: env.id,
        prompt,
        teacherNotes: notes,
        abortSignal: req.signal,
        requestApproval: (r) => broker.request(env, r, req.signal),
        resolvePolicy: async () =>
          resolveEffectivePolicy({
            classPolicy: await repo.getActivePolicy(env.classId),
            classPolicyId: cls.activePolicyId ?? env.classId,
            override: (await repo.getEnvironment(env.id))?.policyOverride ?? null,
          }),
      })
      [Symbol.asyncIterator]();

    // Pull the first event so pause/limit errors become real HTTP statuses.
    let first: IteratorResult<HarnessEvent>;
    try {
      first = await iterator.next();
    } catch (e) {
      // Match by name: class identity is not reliable across Next's module instances.
      const name = (e as Error | undefined)?.name;
      if (name === "EnvironmentPausedError") return new Response("Your teacher has paused this tutor for now.", { status: 423 });
      if (name === "EnvironmentLimitError") return new Response((e as Error).message, { status: 429 });
      throw e;
    }

    const projector = createChunkProjector();
    const stream = createUIMessageStream({
      execute: async ({ writer }) => {
        let r = first;
        while (!r.done) {
          for (const chunk of projector.push(r.value)) writer.write(chunk);
          r = await iterator.next();
        }
      },
      onError: () => "Something went wrong. Please try again.",
    });
    return createUIMessageStreamResponse({ stream });
  } catch (e) {
    return errorResponse(e);
  }
}
