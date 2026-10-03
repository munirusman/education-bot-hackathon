import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { pageUser } from "@/lib/platform/identity";
import { getServices } from "@/lib/platform/services";
import { StudentShell } from "@/components/student/StudentShell";
import { JoinClass } from "@/components/JoinClass";

export const dynamic = "force-dynamic";

export default async function StudentHome() {
  const user = await pageUser("student");
  const classes = await (await getServices()).repo.listClassesForStudent(user.id);
  return (
    <StudentShell student={user.name} classes={classes}>
      <header className="flex h-14 flex-none items-center border-b border-line px-7">
        <h1 className="type-h1 m-0 text-2xl">Your classes</h1>
      </header>
      <div className="mx-auto flex w-full max-w-[720px] flex-col gap-6 p-7">
        <div className="grid gap-3 sm:grid-cols-2">
          {classes.map((c) => (
            <Link key={c.id} href={`/student/${c.id}`} className="flex items-center justify-between rounded-md border border-line bg-card p-4 text-fg-1 no-underline shadow-xs transition-shadow hover:shadow-md">
              <span className="type-h3">{c.name}</span>
              <ArrowRight size={16} className="text-fg-3" aria-hidden />
            </Link>
          ))}
        </div>
        {!classes.length && <p className="type-body text-fg-2">You’re not in a class yet. Ask your teacher for a join code.</p>}
        <JoinClass />
      </div>
    </StudentShell>
  );
}
