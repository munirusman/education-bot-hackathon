import { requireTeacherOfClass } from "@/lib/platform/access";
import { errorResponse } from "@/lib/platform/identity";
import { MaterialError, validateMaterial } from "@/lib/platform/materials";
import { getServices } from "@/lib/platform/services";

const MAX_FILES = 10;
const MAX_MATERIALS_PER_CLASS = 50;

/**
 * Upload course files for a class. Uploading a name that already exists
 * replaces its content and keeps its id, so policies that reference it keep
 * working. A file only reaches students once the teacher selects it in the policy.
 */
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    await requireTeacherOfClass(id);
    const form = await req.formData().catch(() => null);
    if (!form) return Response.json({ error: "Choose a file to upload." }, { status: 400 });
    const files = form.getAll("file").filter((f): f is File => typeof f !== "string");
    if (!files.length) return Response.json({ error: "Choose a file to upload." }, { status: 400 });
    if (files.length > MAX_FILES) return Response.json({ error: `Upload up to ${MAX_FILES} files at a time.` }, { status: 400 });

    const { repo } = await getServices();
    const saved: { id: string; name: string; storageKey: string }[] = [];
    const errors: string[] = [];
    for (const file of files) {
      try {
        const { name, content } = validateMaterial(file.name, new Uint8Array(await file.arrayBuffer()));
        const existing = await repo.findMaterialByName(id, name);
        if (existing) await repo.updateMaterialContent(existing, content);
        else {
          if ((await repo.listMaterials(id)).length >= MAX_MATERIALS_PER_CLASS) throw new MaterialError("This class has reached its limit of 50 files.");
          const newId = await repo.addMaterial({ classId: id, name, content });
          saved.push({ id: newId, name, storageKey: `${id}/${name}` });
          continue;
        }
        saved.push({ id: existing, name, storageKey: `${id}/${name}` });
      } catch (e) {
        if (!(e instanceof MaterialError)) throw e;
        errors.push(e.message);
      }
    }
    return Response.json({ saved, errors, materials: await repo.listMaterials(id) }, { status: saved.length ? 200 : 400 });
  } catch (e) {
    return errorResponse(e);
  }
}
