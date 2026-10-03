import { errorResponse, requireTeacher } from "@/lib/platform/identity";
import { getServices } from "@/lib/platform/services";

/** Resolve a flag. Only the teacher who owns the flag's class may. */
export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const user = await requireTeacher();
    const { repo } = await getServices();
    const mine = await Promise.all((await repo.listClassesForTeacher(user.id)).map((c) => repo.listFlags(c.id)));
    if (!mine.flat().some((f) => f.id === id)) return Response.json({ error: "Not found" }, { status: 404 });
    await repo.resolveFlag(id);
    return Response.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
