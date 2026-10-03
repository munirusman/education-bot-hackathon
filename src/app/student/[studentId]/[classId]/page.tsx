import { notFound } from "next/navigation";
import { Eye } from "lucide-react";
import type { EffectivePolicy } from "@/lib/contracts";
import { pageStudent } from "@/lib/platform/identity";
import { getServices } from "@/lib/platform/services";
import { isToolEnabled, resolveEffectivePolicy } from "@/lib/platform/policy";
import { buildMessages } from "@/lib/projection";
import { StudentChat } from "@/components/chat/StudentChat";
import { StudentShell } from "@/components/student/StudentShell";
import { Badge, Eyebrow, Tag } from "@/components/orbit/core";

export const dynamic = "force-dynamic";

/** Plain statements of what the tutor will do, derived from the policy it actually runs under. */
function tutorWill(p: EffectivePolicy, hasFiles: boolean): string[] {
  const out = [{ "hint-only": "Give hints, not final answers", "guided-steps": "Guide you step by step", explain: "Explain ideas fully" }[p.style]];
  const gated = (t: "read" | "write" | "bash") => (p.approvalRequired.includes(t) ? " with your teacher’s OK" : "");
  if (isToolEnabled(p, "read") && hasFiles) out.push(`Read your class files${gated("read")}`);
  if (isToolEnabled(p, "write")) out.push(`Save notes in your workspace${gated("write")}`);
  out.push(isToolEnabled(p, "bash") ? `Run code${gated("bash")}` : "Not run code");
  return out;
}

export default async function StudentClass({ params }: { params: Promise<{ studentId: string; classId: string }> }) {
  const { studentId, classId } = await params;
  const user = await pageStudent(studentId);
  const { repo, env: envService } = await getServices();
  const cls = await repo.getClass(classId);
  if (!cls || !(await repo.isEnrolled(classId, user.id))) notFound();

  const env = await envService.ensureEnvironment({ classId, studentId: user.id });
  const [events, classes, teacher, classPolicy] = await Promise.all([
    repo.listEvents(env.id),
    repo.listClassesForStudent(user.id),
    repo.getUser(cls.teacherId),
    repo.getActivePolicy(classId),
  ]);
  const row = await repo.getEnvironment(env.id);
  const policy = resolveEffectivePolicy({ classPolicy, classPolicyId: cls.activePolicyId ?? classId, override: row?.policyOverride ?? null });
  const files = isToolEnabled(policy, "read") ? (await repo.getMaterials(classId, policy.materials)).map((m) => m.name) : [];
  const paused = env.status === "paused";

  return (
    <StudentShell student={user} classes={classes} activeClassId={classId} classCaption={`${cls.name} · ${teacher?.name ?? "Your teacher"}`} files={files}>
      <header className="flex h-14 flex-none items-center gap-3 border-b border-line px-7">
        <h1 className="type-h1 m-0 truncate text-2xl">{policy.unit ?? policy.subject}</h1>
        <span className="type-caption ml-auto inline-flex flex-none items-center gap-1.5 text-fg-2">
          <Eye size={14} aria-hidden />
          Your teacher can see this session
        </span>
      </header>
      <div className="flex flex-none flex-wrap items-center gap-2.5 border-b border-line bg-card px-7 py-2.5">
        <Eyebrow>Your tutor will</Eyebrow>
        {tutorWill(policy, files.length > 0).map((t) => <Tag key={t} mono>{t}</Tag>)}
        {policy.assessmentActive && <Badge tone="teacher">Test mode: your tutor will only clarify questions</Badge>}
      </div>
      <div className="min-h-0 flex-1">
        <StudentChat key={env.id} environmentId={env.id} initialMessages={buildMessages(events, { forStudent: true })} paused={paused} />
      </div>
    </StudentShell>
  );
}
