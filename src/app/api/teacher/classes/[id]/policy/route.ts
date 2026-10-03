import { policyUpdateSchema } from "@/lib/contracts";
import { requireTeacherOfClass } from "@/lib/platform/access";
import { errorResponse } from "@/lib/platform/identity";
import { getServices } from "@/lib/platform/services";

/** Saves a new policy version. Takes effect on each student's next turn. */
export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    await requireTeacherOfClass(id);
    const { policy } = policyUpdateSchema.parse(await req.json());
    const saved = await (await getServices()).repo.savePolicy(id, policy);
    return Response.json({ version: saved.version });
  } catch (e) {
    return errorResponse(e);
  }
}
