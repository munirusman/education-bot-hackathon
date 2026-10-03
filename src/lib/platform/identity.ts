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
 * No-auth MVP: the route decides who you are. /teacher (and /api/teacher) act as
 * the demo teacher, /student (and /api/chat) as the demo student. There is no
 * cookie or login, so it works inside proxies and iframes. Every route still
 * checks role and ownership server-side (a student cannot reach another
 * student's environment), so adding real auth later means replacing this
 * one function.
 */
const DEMO_IDS = { teacher: "usr_rivera", student: "usr_ava" } as const;

export async function requireUser(role: "teacher" | "student"): Promise<User> {
  if (process.env.DEMO_MODE === "false") throw new HttpError(401, "Sign-in is not configured");
  const id = process.env[`DEMO_${role.toUpperCase()}_ID`] ?? DEMO_IDS[role];
  const user = await (await getServices()).repo.getUser(id);
  if (!user || user.role !== role) throw new HttpError(401, `No ${role} account`);
  return user;
}

/** For pages: the demo user for this role, or a 404 page. */
export async function pageUser(role: "teacher" | "student"): Promise<User> {
  try {
    return await requireUser(role);
  } catch {
    notFound();
  }
}

/** Teacher owns the environment's class. Admins pass. Returns the environment row. */
export async function requireTeacherOf(environmentId: string) {
  const user = await requireUser("teacher");
  const { repo } = await getServices();
  const env = await repo.getEnvironment(environmentId);
  const cls = env && (await repo.getClass(env.classId));
  if (!env || !cls || cls.teacherId !== user.id) throw new HttpError(404, "Not found");
  return { user, env, cls };
}

/** Student owns the environment (and is still enrolled). Checked on every request. */
export async function requireStudentOf(environmentId: string) {
  const user = await requireUser("student");
  const { repo } = await getServices();
  const env = await repo.getEnvironment(environmentId);
  if (!env || env.studentId !== user.id || !(await repo.isEnrolled(env.classId, user.id))) throw new HttpError(404, "Not found");
  return { user, env };
}

export function errorResponse(e: unknown) {
  if (e instanceof HttpError) return Response.json({ error: e.message }, { status: e.status });
  if (e instanceof ZodError) return Response.json({ error: e.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ") }, { status: 400 });
  console.error(e);
  return Response.json({ error: "Internal error" }, { status: 500 });
}
