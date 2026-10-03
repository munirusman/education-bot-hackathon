import Link from "next/link";
import { notFound } from "next/navigation";
import { pageUser } from "@/lib/platform/identity";
import { getServices } from "@/lib/platform/services";
import { PolicyEditor } from "@/components/teacher/PolicyEditor";

export const dynamic = "force-dynamic";

export default async function PolicyPage({ params }: { params: Promise<{ classId: string }> }) {
  const { classId } = await params;
  const user = await pageUser("teacher");
  const { repo } = await getServices();
  const cls = await repo.getClass(classId);
  if (!cls || cls.teacherId !== user.id) notFound();
  const [policy, materials] = await Promise.all([repo.getActivePolicy(classId), repo.listMaterials(classId)]);
  return (
    <div className="space-y-4">
      <Link href={`/teacher/${classId}`} className="text-sm text-indigo-700 hover:underline">← {cls.name}</Link>
      <h1 className="text-2xl font-bold">Assistant policy</h1>
      <PolicyEditor classId={classId} initial={policy} materials={materials} />
    </div>
  );
}
