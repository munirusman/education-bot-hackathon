import { requireTeacherOfClass } from "@/lib/platform/access";
import { loadDashboard } from "@/lib/platform/dashboard";
import { errorResponse } from "@/lib/platform/identity";
import { getServices } from "@/lib/platform/services";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    await requireTeacherOfClass(id);
    const { repo } = await getServices();
    const [dashboard, flags, approvals] = await Promise.all([loadDashboard(repo, id), repo.listFlags(id), repo.listPendingApprovalsForClass(id)]);
    return Response.json({ ...dashboard, flags, approvals });
  } catch (e) {
    return errorResponse(e);
  }
}
