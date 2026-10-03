import Link from "next/link";
import { FileText, MessageSquare } from "lucide-react";
import type { ReactNode } from "react";
import { Avatar, cx, Eyebrow, Logo } from "../orbit/core";

/** Student chrome from the Orbit student-tutor kit: 260px sidebar with classes and readable files. */
export function StudentShell({
  student,
  classes,
  activeClassId,
  classCaption,
  files,
  children,
}: {
  student: string;
  classes: { id: string; name: string }[];
  activeClassId?: string;
  classCaption?: string;
  files?: string[];
  children: ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <aside className="flex w-[260px] flex-none flex-col gap-[18px] border-r border-line bg-page px-3.5 py-[18px]">
        <Link href="/" className="px-2.5" aria-label="Orbit home"><Logo size={26} /></Link>
        <nav className="flex flex-col gap-1" aria-label="Classes">
          <Eyebrow className="px-1.5 pb-1">{classCaption ?? "Your classes"}</Eyebrow>
          {classes.map((c) => {
            const active = c.id === activeClassId;
            return (
              <Link key={c.id} href={`/student/${c.id}`} className={cx("flex h-[34px] items-center gap-2 rounded-sm px-2 type-label text-sm no-underline", active ? "bg-plum-50 text-plum-700" : "text-fg-2 hover:bg-sand-100 hover:text-fg-1")}>
                <MessageSquare size={15} aria-hidden />
                {c.name}
              </Link>
            );
          })}
          {!classes.length && <p className="type-caption px-1.5 text-fg-3">No classes yet.</p>}
        </nav>
        {files && (
          <div className="flex flex-col gap-1.5">
            <Eyebrow className="px-1.5">Files your tutor can read</Eyebrow>
            {files.map((f) => (
              <div key={f} className="flex items-center gap-2 p-2 type-rule text-xs text-fg-1">
                <FileText size={15} className="flex-none text-fg-2" aria-hidden />
                <span className="truncate">{f}</span>
              </div>
            ))}
            {!files.length && <p className="type-caption px-1.5 text-fg-3">Your teacher hasn’t shared any files.</p>}
          </div>
        )}
        <div className="mt-auto flex items-center gap-2.5 px-2.5 py-2">
          <Avatar name={student} size={28} />
          <div>
            <div className="type-label">{student}</div>
            <div className="type-caption text-fg-3">Student · demo account</div>
          </div>
        </div>
      </aside>
      <main className="flex min-w-0 flex-1 flex-col bg-page">{children}</main>
    </div>
  );
}
