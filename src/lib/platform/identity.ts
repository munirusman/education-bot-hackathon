import { notFound } from "next/navigation";
import { ZodError } from "zod";
import type { User } from "@/lib/db/repo.ts";
import { getServices } from "./services.ts";

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/**
 * No-auth MVP: there is no cookie or login, so it works inside proxies and
 * iframes. The route says who you are. /teacher acts as the demo teacher; for
 * students the id in the URL (/student/<id>) is the identity, chosen or created
 * on the home screen. Every route still checks role, enrolment and environment
 * ownership server-side, so one student's page or chat can't reach another
 * student's environment. Adding real auth later means replacing these functions.
 * Anyone who can reach the app can act as any student: demo data only.
 */
const DEMO_TEACHER_ID = "usr_rivera";

function assertDemo() {
  if (process.env.DEMO_MODE === "false") throw new HttpError(401, "Sign-in is not configured");
}

export async function requireTeacher(): Promise<User> {
  assertDemo();
  const user = await (await getServices()).repo.getUser(process.env.DEMO_TEACHER_ID ?? DEMO_TEACHER_ID);
  if (!user || user.role !== "teacher") throw new HttpError(401, "No teacher account");
  return user;
}

export async function requireStudent(studentId: string): Promise<User> {
  assertDemo();
  const user = await (await getServices()).repo.getUser(studentId);
  if (!user || user.role !== "student") throw new HttpError(404, "Not found");
  return user;
}

/** For pages: the demo teacher, or a 404 page. */
export async function pageTeacher(): Promise<User> {
  try {
    return await requireTeacher();
  } catch {
    notFound();
  }
}

/** For pages: the student named in the URL, or a 404 page. */
export async function pageStudent(studentId: string): Promise<User> {
  try {
    return await requireStudent(studentId);
  } catch {
    notFound();
  }
}

/** Teacher owns the environment's class. Admins pass. Returns the environment row. */
export async function requireTeacherOf(environmentId: string) {
  const user = await requireTeacher();
  const { repo } = await getServices();
  const env = await repo.getEnvironment(environmentId);
  const cls = env && (await repo.getClass(env.classId));
  if (!env || !cls || cls.teacherId !== user.id) throw new HttpError(404, "Not found");
  return { user, env, cls };
}

/**
 * The environment names its student; they must still be enrolled. Checked on
 * every chat request. Environment ids are unguessable, and a student page can
 * only ever open its own student's environment (see pageStudent + ensureEnvironment).
 */
export async function requireStudentOf(environmentId: string) {
  assertDemo();
  const { repo } = await getServices();
  const env = await repo.getEnvironment(environmentId);
  const user = env && (await repo.getUser(env.studentId));
  if (!env || !user || user.role !== "student" || !(await repo.isEnrolled(env.classId, user.id))) throw new HttpError(404, "Not found");
  return { user, env };
}

export function errorResponse(e: unknown) {
  if (e instanceof HttpError) return Response.json({ error: e.message }, { status: e.status });
  if (e instanceof ZodError) return Response.json({ error: e.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ") }, { status: 400 });
  console.error(e);
  return Response.json({ error: "Internal error" }, { status: 500 });
}
