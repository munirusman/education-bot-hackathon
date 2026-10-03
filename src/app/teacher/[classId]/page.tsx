import { notFound } from "next/navigation";
import { pageTeacher } from "@/lib/platform/identity";
import { getServices } from "@/lib/platform/services";
import { loadClassView } from "@/lib/platform/class-view";
import { ClassroomLive } from "@/components/teacher/ClassroomLive";
import { LiveHeader } from "@/components/teacher/LiveHeader";

export const dynamic = "force-dynamic";

export default async function ClassPage({ params }: { params: Promise<{ classId: string }> }) {
  const { classId } = await params;
  const user = await pageTeacher();
  const services = await getServices();
  const cls = await services.repo.getClass(classId);
  if (!cls || cls.teacherId !== user.id) notFound();
  const view = await loadClassView(services, classId, cls.activePolicyId);
  return (
    <>
      <LiveHeader classId={classId} policy={view.policy} testMode={view.testMode} online={view.online} total={view.total} />
      <div className="min-h-0 flex-1 overflow-auto p-7">
        <ClassroomLive classId={classId} initial={view.data} />
        <p className="type-caption mt-6 text-fg-3">Join code <span className="font-mono text-fg-2">{cls.joinCode}</span></p>
      </div>
    </>
  );
}
