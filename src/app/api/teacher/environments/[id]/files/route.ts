import { errorResponse, requireTeacherOf } from "@/lib/platform/identity";
import { getServices } from "@/lib/platform/services";

/** Read-only view of the student's sandbox. Every read is audited. */
export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const { user } = await requireTeacherOf(id);
    const { repo, env } = await getServices();
    const path = new URL(req.url).searchParams.get("path");
    if (!path) return Response.json(await env.readSandboxTree(id));
    await repo.logTeacherAction({ environmentId: id, teacherId: user.id, action: "view", payload: { file: path } });
    return Response.json({ path, content: await env.readSandboxFile(id, path) });
  } catch (e) {
    return errorResponse(e);
  }
}
