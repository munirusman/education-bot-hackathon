import { classTopic } from "@/lib/contracts";
import { requireTeacherOfClass } from "@/lib/platform/access";
import { errorResponse } from "@/lib/platform/identity";
import { getServices } from "@/lib/platform/services";
import { sseResponse } from "@/lib/platform/sse";

export const dynamic = "force-dynamic";

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    await requireTeacherOfClass(id);
    const { bus } = await getServices();
    return sseResponse((send) => bus.subscribe(classTopic(id), send), req.signal);
  } catch (e) {
    return errorResponse(e);
  }
}
