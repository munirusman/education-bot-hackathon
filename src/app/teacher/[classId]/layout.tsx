import { notFound } from "next/navigation";
import { pageTeacher } from "@/lib/platform/identity";
import { getServices } from "@/lib/platform/services";
import { TeacherShell } from "@/components/teacher/TeacherShell";

export default async function ClassLayout({ children, params }: { children: React.ReactNode; params: Promise<{ classId: string }> }) {
  const { classId } = await params;
  const user = await pageTeacher();
  const { repo } = await getServices();
  const classes = await repo.listClassesForTeacher(user.id);
  if (!classes.some((c) => c.id === classId)) notFound();
  return <TeacherShell teacher={user.name} classes={classes} activeClassId={classId}>{children}</TeacherShell>;
}
