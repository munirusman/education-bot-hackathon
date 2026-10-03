import Link from "next/link";
import { pageUser } from "@/lib/platform/identity";
import { getServices } from "@/lib/platform/services";
import { JoinClass } from "@/components/JoinClass";

export const dynamic = "force-dynamic";

export default async function StudentHome() {
  const user = await pageUser("student");
  const classes = await (await getServices()).repo.listClassesForStudent(user.id);
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Your classes</h1>
      <div className="grid gap-3 sm:grid-cols-2">
        {classes.map((c) => (
          <Link key={c.id} href={`/student/${c.id}`} className="card hover:border-indigo-400">
            <div className="font-semibold">{c.name}</div>
            <div className="text-sm text-slate-500">Open your tutor</div>
          </Link>
        ))}
        {!classes.length && <p className="text-slate-500">You are not in a class yet.</p>}
      </div>
      <JoinClass />
    </div>
  );
}
