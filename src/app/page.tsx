import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Logo } from "@/components/orbit/core";
import { StudentPicker } from "@/components/student/StudentPicker";
import { loadPickerStudents } from "@/components/student/loadPicker";

export const dynamic = "force-dynamic";

export default async function Home() {
  const demo = process.env.DEMO_MODE !== "false";
  return (
    <div className="mx-auto flex min-h-screen max-w-4xl flex-col justify-center gap-8 px-7 py-12">
      <Logo size={34} />
      <div className="flex flex-col gap-3">
        <h1 className="m-0 font-serif text-5xl leading-[1.1] font-normal tracking-[-0.02em]">A private tutor for every student. You stay in charge.</h1>
        <p className="type-body-lg m-0 max-w-xl text-fg-2">Each student gets their own tutor in a private workspace. You set how it behaves, see who is working or stuck, and step in when it matters.</p>
      </div>
      {demo ? (
        <>
          <section className="flex flex-col gap-3" aria-labelledby="teacher-h">
            <h2 id="teacher-h" className="type-eyebrow m-0 text-fg-3">Teacher</h2>
            <Link href="/teacher" className="flex items-center justify-between rounded-md border border-line bg-card p-4 text-fg-1 no-underline shadow-xs transition-shadow hover:shadow-md">
              <span>
                <span className="type-h3 block">Open the teacher console</span>
                <span className="type-caption text-fg-3">Ms. Rivera · live classroom, tutor rules, sessions</span>
              </span>
              <ArrowRight size={16} className="text-fg-3" aria-hidden />
            </Link>
          </section>
          <section className="flex flex-col gap-3" aria-labelledby="student-h">
            <h2 id="student-h" className="type-eyebrow m-0 text-fg-3">Student</h2>
            <StudentPicker students={await loadPickerStudents()} />
          </section>
          <p className="type-caption m-0 text-fg-3">Demo mode: there’s no sign-in or password. Anyone can open any account, so use demo data only.</p>
        </>
      ) : (
        <p className="type-body text-fg-2">Sign-in isn’t configured.</p>
      )}
    </div>
  );
}
