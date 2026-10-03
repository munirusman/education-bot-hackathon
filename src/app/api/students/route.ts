import { z } from "zod";
import { errorResponse, HttpError } from "@/lib/platform/identity";
import { MAX_STUDENTS, normalizeStudentName, StudentError } from "@/lib/platform/students";
import { getServices } from "@/lib/platform/services";
import { newId } from "@/lib/db/repo";

/**
 * Create a new student account (demo mode: no sign-up flow or password).
 * With a join code the student is enrolled in that class straight away; an
 * unknown code creates nothing, so a typo doesn't leave a stray account.
 */
export async function POST(req: Request) {
  try {
    if (process.env.DEMO_MODE === "false") throw new HttpError(403, "Sign-up is not available");
    const body = z.object({ name: z.string(), joinCode: z.string().max(20).optional() }).parse(await req.json().catch(() => ({})));
    const name = normalizeStudentName(body.name);
    const { repo, env } = await getServices();
    if ((await repo.listUsers("student")).length >= MAX_STUDENTS) throw new HttpError(429, "This demo has reached its limit of students.");

    const code = body.joinCode?.trim();
    const cls = code ? await repo.getClassByJoinCode(code) : null;
    if (code && !cls) throw new HttpError(404, "No class has that join code.");

    const id = newId("usr");
    await repo.upsertUser({ id, name, role: "student" });
    if (cls) {
      await repo.enroll(cls.id, id);
      await env.ensureEnvironment({ classId: cls.id, studentId: id });
    }
    return Response.json({ studentId: id, classId: cls?.id ?? null });
  } catch (e) {
    if (e instanceof StudentError) return Response.json({ error: e.message }, { status: 400 });
    return errorResponse(e);
  }
}
