import { notFound } from "next/navigation";
import { pageTeacher } from "@/lib/platform/identity";
import { getServices } from "@/lib/platform/services";
import { PolicyEditor } from "@/components/teacher/PolicyEditor";
import { TopBar } from "@/components/teacher/TeacherShell";

export const dynamic = "force-dynamic";

export default async function PolicyPage({ params }: { params: Promise<{ classId: string }> }) {
  const { classId } = await params;
  const user = await pageTeacher();
  const { repo } = await getServices();
  const cls = await repo.getClass(classId);
  if (!cls || cls.teacherId !== user.id) notFound();
  const [policy, materials] = await Promise.all([repo.getActivePolicy(classId), repo.listMaterials(classId)]);
  return (
    <>
      <TopBar title="Tutor rules" />
      <div className="min-h-0 flex-1 overflow-auto p-7">
        <PolicyEditor classId={classId} initial={policy} materials={materials} />
      </div>
    </>
  );
}
