import { envTopic } from "@/lib/contracts";
import { errorResponse, requireTeacherOf } from "@/lib/platform/identity";
import { getServices } from "@/lib/platform/services";
import { sseResponse } from "@/lib/platform/sse";

export const dynamic = "force-dynamic";

/** Live mirror: the same events the student's stream is built from. */
export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    await requireTeacherOf(id);
    const { bus } = await getServices();
    return sseResponse((send) => bus.subscribe(envTopic(id), send), req.signal);
  } catch (e) {
    return errorResponse(e);
  }
}
