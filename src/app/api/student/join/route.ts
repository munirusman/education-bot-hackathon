import { errorResponse, requireStudent } from "@/lib/platform/identity";
import { getServices } from "@/lib/platform/services";

export async function POST(req: Request) {
  try {
    const { studentId, code } = (await req.json()) as { studentId?: string; code?: string };
    const user = await requireStudent(studentId ?? "");
    const { repo, env } = await getServices();
    const cls = code ? await repo.getClassByJoinCode(code.trim()) : null;
    if (!cls) return Response.json({ error: "No class has that join code" }, { status: 404 });
    await repo.enroll(cls.id, user.id);
    await env.ensureEnvironment({ classId: cls.id, studentId: user.id });
    return Response.json({ classId: cls.id });
  } catch (e) {
    return errorResponse(e);
  }
}
