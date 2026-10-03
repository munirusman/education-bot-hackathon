import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { pageTeacher } from "@/lib/platform/identity";
import { getServices } from "@/lib/platform/services";
import { CreateClass } from "@/components/teacher/CreateClass";
import { TeacherShell, TopBar } from "@/components/teacher/TeacherShell";

export const dynamic = "force-dynamic";

export default async function TeacherHome() {
  const user = await pageTeacher();
  const { repo } = await getServices();
  const classes = await repo.listClassesForTeacher(user.id);
  return (
    <TeacherShell teacher={user.name} classes={classes}>
      <TopBar title="Your classes" />
      <div className="min-h-0 flex-1 overflow-auto p-7">
        <div className="flex max-w-3xl flex-col gap-6">
          <div className="grid gap-3 sm:grid-cols-2">
            {classes.map((c) => (
              <Link key={c.id} href={`/teacher/${c.id}`} className="flex items-center justify-between rounded-md border border-line bg-card p-4 text-fg-1 no-underline shadow-xs transition-shadow hover:shadow-md">
                <span>
                  <span className="type-h3 block">{c.name}</span>
                  <span className="type-caption text-fg-3">Join code <span className="font-mono text-fg-2">{c.joinCode}</span></span>
                </span>
                <ArrowRight size={16} className="text-fg-3" aria-hidden />
              </Link>
            ))}
          </div>
          <CreateClass />
        </div>
      </div>
    </TeacherShell>
  );
}
