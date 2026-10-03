import { notFound } from "next/navigation";
import { pageUser } from "@/lib/platform/identity";
import { getServices } from "@/lib/platform/services";
import { loadClassView } from "@/lib/platform/class-view";
import { tileState } from "@/lib/platform/dashboard";
import { resolveEffectivePolicy } from "@/lib/platform/policy";
import { ClassroomLive } from "@/components/teacher/ClassroomLive";
import { LiveHeader } from "@/components/teacher/LiveHeader";
import { SessionPanel } from "@/components/teacher/SessionPanel";

export const dynamic = "force-dynamic";

/** Orbit's drill-in: the classroom grid stays visible with the session in a 420px right panel. */
export default async function StudentDrillIn({ params }: { params: Promise<{ classId: string; envId: string }> }) {
  const { classId, envId } = await params;
  const user = await pageUser("teacher");
  const services = await getServices();
  const { repo } = services;
  const [cls, env] = await Promise.all([repo.getClass(classId), repo.getEnvironment(envId)]);
  if (!cls || !env || env.classId !== classId || cls.teacherId !== user.id) notFound();

  // Every teacher view of a student session is audited (collapsed to one entry per minute).
  const recent = (await repo.listTeacherActions(envId)).find((a) => a.action === "view" && a.teacherId === user.id && (a.payload as { page?: string })?.page === "drill-in");
  if (!recent || Date.now() - new Date(recent.at).getTime() > 60_000) {
    await repo.logTeacherAction({ environmentId: envId, teacherId: user.id, action: "view", payload: { page: "drill-in" } });
  }

  const [view, student, events, approvals, flags, actions, turns] = await Promise.all([
    loadClassView(services, classId, cls.activePolicyId),
    repo.getUser(env.studentId),
    repo.listEvents(envId),
    repo.listPendingApprovals(envId),
    repo.listFlagsForEnvironment(envId),
    repo.listTeacherActions(envId),
    repo.listTurns(envId, 20),
  ]);
  const effective = resolveEffectivePolicy({ classPolicy: view.policy, classPolicyId: cls.activePolicyId ?? classId, override: env.policyOverride });
  const tile = view.data.tiles.find((t) => t.environmentId === envId);

  return (
    <>
      <LiveHeader classId={classId} policy={view.policy} testMode={view.testMode} online={view.online} total={view.total} />
      <div className="flex min-h-0 flex-1">
        <div className="min-w-0 flex-1 overflow-auto p-7">
          <ClassroomLive classId={classId} initial={view.data} selected={envId} />
        </div>
        <SessionPanel
          key={envId}
          classId={classId}
          environmentId={envId}
          studentName={student?.name ?? "Student"}
          state={tile ? tileState(tile) : env.status === "paused" ? "paused" : "offline"}
          paused={env.status === "paused"}
          caption={effective.unit ?? effective.subject}
          policy={effective}
          override={env.policyOverride}
          approvals={approvals.map((a) => ({ id: a.id, toolName: a.toolName, input: a.input }))}
          flags={flags.map((f) => ({ id: f.id, kind: f.kind, detail: f.detail, evidence: f.evidence }))}
          turns={turns}
          actions={actions}
          events={events}
        />
      </div>
    </>
  );
}
