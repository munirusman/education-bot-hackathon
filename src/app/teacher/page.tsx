import Link from "next/link";
import { pageUser } from "@/lib/platform/identity";
import { getServices } from "@/lib/platform/services";
import { CreateClass } from "@/components/teacher/CreateClass";

export const dynamic = "force-dynamic";

export default async function TeacherHome() {
  const user = await pageUser("teacher");
  const { repo } = await getServices();
  const classes = await repo.listClassesForTeacher(user.id);
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Your classes</h1>
      <div className="grid gap-3 sm:grid-cols-2">
        {classes.map((c) => (
          <Link key={c.id} href={`/teacher/${c.id}`} className="card hover:border-indigo-400">
            <div className="font-semibold">{c.name}</div>
            <div className="text-sm text-slate-500">Join code <code className="font-mono">{c.joinCode}</code></div>
          </Link>
        ))}
      </div>
      <CreateClass />
    </div>
  );
}
