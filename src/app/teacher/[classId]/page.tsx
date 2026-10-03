import Link from "next/link";
import { notFound } from "next/navigation";
import { pageUser } from "@/lib/platform/identity";
import { getServices } from "@/lib/platform/services";
import { loadDashboard } from "@/lib/platform/dashboard";
import { ClassDashboard } from "@/components/teacher/ClassDashboard";

export const dynamic = "force-dynamic";

export default async function ClassPage({ params }: { params: Promise<{ classId: string }> }) {
  const { classId } = await params;
  const user = await pageUser("teacher");
  const { repo } = await getServices();
  const cls = await repo.getClass(classId);
  if (!cls || cls.teacherId !== user.id) notFound();
  const [dash, flags, approvals, policy] = await Promise.all([loadDashboard(repo, classId), repo.listFlags(classId), repo.listPendingApprovalsForClass(classId), repo.getActivePolicy(classId)]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">{cls.name}</h1>
          <p className="text-sm text-slate-500">
            {policy.subject} · policy v{policy.version} · join code <code className="font-mono">{cls.joinCode}</code>
          </p>
        </div>
        <Link href={`/teacher/${classId}/policy`} className="btn">Assistant policy</Link>
      </div>
      <ClassDashboard classId={classId} initial={{ ...dash, flags, approvals }} />
    </div>
  );
}
