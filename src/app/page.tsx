import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Logo } from "@/components/orbit/core";

export default function Home() {
  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-8 px-7 py-12">
      <Logo size={34} />
      <div className="flex flex-col gap-3">
        <h1 className="m-0 font-serif text-5xl leading-[1.1] font-normal tracking-[-0.02em]">A private tutor for every student. You stay in charge.</h1>
        <p className="type-body-lg m-0 max-w-xl text-fg-2">Each student gets their own tutor in a private workspace. You set how it behaves, see who is working or stuck, and step in when it matters.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {[
          { href: "/teacher", eyebrow: "Teacher", title: "Open the teacher console", body: "Ms. Rivera · live classroom, tutor rules, sessions" },
          { href: "/student", eyebrow: "Student", title: "Open the student tutor", body: "Ava Chen · ask your tutor for help" },
        ].map((c) => (
          <Link key={c.href} href={c.href} className="flex flex-col gap-1 rounded-md border border-line bg-card p-4 text-fg-1 no-underline shadow-xs transition-shadow hover:shadow-md">
            <span className="type-eyebrow text-fg-3">{c.eyebrow}</span>
            <span className="type-h3 flex items-center justify-between">{c.title}<ArrowRight size={16} className="text-fg-3" aria-hidden /></span>
            <span className="type-caption text-fg-3">{c.body}</span>
          </Link>
        ))}
      </div>
      <p className="type-caption m-0 text-fg-3">Demo mode: there’s no sign-in. Each side opens as a built-in demo account.</p>
    </div>
  );
}
