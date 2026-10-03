import Link from "next/link";
import { notFound } from "next/navigation";
import { pageUser } from "@/lib/platform/identity";
import { getServices } from "@/lib/platform/services";
import { resolveEffectivePolicy } from "@/lib/platform/policy";
import { TeacherThread } from "@/components/teacher/TeacherThread";
import { InterventionPanel } from "@/components/teacher/InterventionPanel";
import { SandboxViewer } from "@/components/teacher/SandboxViewer";

export const dynamic = "force-dynamic";

export default async function StudentDrillIn({ params }: { params: Promise<{ classId: string; envId: string }> }) {
  const { classId, envId } = await params;
  const user = await pageUser("teacher");
  const { repo } = await getServices();
  const [cls, env] = await Promise.all([repo.getClass(classId), repo.getEnvironment(envId)]);
  if (!cls || !env || env.classId !== classId || cls.teacherId !== user.id) notFound();

  // Every teacher view of a student session is audited (collapsed to one entry per minute).
  const recent = (await repo.listTeacherActions(envId)).find((a) => a.action === "view" && a.teacherId === user.id && (a.payload as { page?: string })?.page === "drill-in");
  if (!recent || Date.now() - new Date(recent.at).getTime() > 60_000) {
    await repo.logTeacherAction({ environmentId: envId, teacherId: user.id, action: "view", payload: { page: "drill-in" } });
  }

  const [student, events, approvals, flags, actions, turns, classPolicy] = await Promise.all([
    repo.getUser(env.studentId),
    repo.listEvents(envId),
    repo.listPendingApprovals(envId),
    repo.listFlagsForEnvironment(envId),
    repo.listTeacherActions(envId),
    repo.listTurns(envId, 20),
    repo.getActivePolicy(classId),
  ]);
  const effective = resolveEffectivePolicy({ classPolicy, classPolicyId: cls.activePolicyId ?? classId, override: env.policyOverride });

  return (
    <div className="space-y-4">
      <Link href={`/teacher/${classId}`} className="text-sm text-indigo-700 hover:underline">← {cls.name}</Link>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold">{student?.name}</h1>
        <span className="badge bg-slate-100 text-slate-700">{env.status}</span>
        <span className="text-sm text-slate-500">Running: {effective.style}{effective.assessmentActive ? " · assessment lock" : ""}{env.policyOverride ? " · student override" : ""}</span>
      </div>

      {flags.length > 0 && (
        <div className="space-y-1">
          {flags.map((f) => (
            <div key={f.id} className={`rounded-md border px-3 py-2 text-sm ${f.kind === "wellbeing" ? "border-red-300 bg-red-50 text-red-900" : "border-amber-200 bg-amber-50 text-amber-900"}`}>
              <strong>{f.kind}</strong> — {f.detail} <span className="italic opacity-70">"{f.evidence}"</span>
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-5">
        <section className="card lg:col-span-3">
          <h2 className="mb-2 font-semibold">Live conversation <span className="text-xs font-normal text-slate-400">(read-only)</span></h2>
          <TeacherThread environmentId={envId} initialEvents={events as never} />
        </section>
        <div className="space-y-4 lg:col-span-2">
          <InterventionPanel
            environmentId={envId}
            status={env.status}
            override={env.policyOverride}
            approvals={approvals.map((a) => ({ id: a.id, toolName: a.toolName, input: a.input }))}
          />
          <SandboxViewer environmentId={envId} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card">
          <h2 className="mb-2 font-semibold">Past questions</h2>
          <ul className="divide-y divide-slate-100 text-sm">
            {turns.map((t) => (
              <li key={t.id} className="py-1.5">
                <span className="text-xs text-slate-400">{new Date(t.startedAt).toLocaleString()} · policy v{t.policyVersion}</span>
                <p>{t.prompt}</p>
              </li>
            ))}
            {!turns.length && <li className="py-1.5 text-slate-500">No questions yet.</li>}
          </ul>
        </section>
        <section className="card">
          <h2 className="mb-2 font-semibold">Teacher activity log</h2>
          <ul className="divide-y divide-slate-100 text-sm">
            {actions.slice(0, 15).map((a) => (
              <li key={a.id} className="py-1.5"><code>{a.action}</code> <span className="text-xs text-slate-400">{new Date(a.at).toLocaleString()}</span></li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
