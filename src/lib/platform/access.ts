import { HttpError, requireUser } from "./identity.ts";
import { getServices } from "./services.ts";

export async function requireTeacherOfClass(classId: string) {
  const user = await requireUser("teacher");
  const { repo } = await getServices();
  const cls = await repo.getClass(classId);
  if (!cls || cls.teacherId !== user.id) throw new HttpError(404, "Not found");
  return { user, cls };
}
