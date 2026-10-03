import { notFound } from "next/navigation";
import { pageUser } from "@/lib/platform/identity";
import { getServices } from "@/lib/platform/services";
import { buildMessages } from "@/lib/projection";
import { StudentChat } from "@/components/chat/StudentChat";

export const dynamic = "force-dynamic";

export default async function StudentClass({ params }: { params: Promise<{ classId: string }> }) {
  const { classId } = await params;
  const user = await pageUser("student");
  const { repo, env: envService } = await getServices();
  const cls = await repo.getClass(classId);
  if (!cls || !(await repo.isEnrolled(classId, user.id))) notFound();

  const env = await envService.ensureEnvironment({ classId, studentId: user.id });
  const messages = buildMessages(await repo.listEvents(env.id), { forStudent: true });
  const policy = await repo.getActivePolicy(classId);

  return (
    <div className="space-y-3">
      <div>
        <h1 className="text-xl font-bold">{cls.name}</h1>
        <p className="text-sm text-slate-500">{policy.subject}{policy.unit ? ` · ${policy.unit}` : ""}</p>
      </div>
      <p className="rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-700" role="note">
        Your teacher can see your conversations with this tutor, including any files it works with. Don't share personal information.
      </p>
      <StudentChat key={env.id} environmentId={env.id} initialMessages={messages} paused={env.status === "paused"} />
    </div>
  );
}
