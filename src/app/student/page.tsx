import { Logo } from "@/components/orbit/core";
import { StudentPicker } from "@/components/student/StudentPicker";
import { loadPickerStudents } from "@/components/student/loadPicker";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function StudentEntry() {
  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-6 px-7 py-12">
      <Link href="/" aria-label="Orbit home"><Logo size={30} /></Link>
      <div className="flex flex-col gap-1">
        <h1 className="type-h1 m-0 text-4xl">Who’s learning today?</h1>
        <p className="type-body-lg m-0 text-fg-2">Pick your name, or create a new student to get started.</p>
      </div>
      <StudentPicker students={await loadPickerStudents()} />
    </div>
  );
}
