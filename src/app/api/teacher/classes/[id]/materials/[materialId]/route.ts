import { requireTeacherOfClass } from "@/lib/platform/access";
import { errorResponse } from "@/lib/platform/identity";
import { getServices } from "@/lib/platform/services";

/** Remove a course file. Policies that still list it simply stop delivering it (it is filtered per turn). */
export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string; materialId: string }> }) {
  try {
    const { id, materialId } = await ctx.params;
    await requireTeacherOfClass(id);
    const { repo } = await getServices();
    if (!(await repo.deleteMaterial(id, materialId))) return Response.json({ error: "Not found" }, { status: 404 });
    return Response.json({ materials: await repo.listMaterials(id) });
  } catch (e) {
    return errorResponse(e);
  }
}
