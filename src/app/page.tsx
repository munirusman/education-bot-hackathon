import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">A private AI tutor for every student</h1>
        <p className="mt-1 text-slate-600">Each student gets their own sandboxed tutor. Teachers set the rules, watch every session, and can step in at any time.</p>
      </div>
      <p className="text-sm text-slate-500">Demo mode: there is no sign-in. Each side opens as a built-in demo account.</p>
      <div className="grid gap-6 sm:grid-cols-2">
        <Link href="/teacher" className="card hover:border-indigo-400">
          <h2 className="text-lg font-semibold">Teacher</h2>
          <p className="text-sm text-slate-500">Ms. Rivera: dashboard, policy, live sessions</p>
        </Link>
        <Link href="/student" className="card hover:border-indigo-400">
          <h2 className="text-lg font-semibold">Student</h2>
          <p className="text-sm text-slate-500">Ava Chen: chat with your tutor</p>
        </Link>
      </div>
    </div>
  );
}
