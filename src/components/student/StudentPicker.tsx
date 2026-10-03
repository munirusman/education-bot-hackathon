"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { Avatar, Button, Card } from "../orbit/core";
import { Input } from "../orbit/forms";

/** The student half of the initial screen: continue as an existing student, or create a new one. */
export function StudentPicker({ students }: { students: { id: string; name: string; classes: number }[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/students", { method: "POST", body: JSON.stringify({ name, joinCode: code || undefined }) });
    const out = await res.json().catch(() => ({ error: "Something went wrong." }));
    setBusy(false);
    if (!res.ok) return setError(out.error ?? "Couldn’t create that student.");
    router.push(out.classId ? `/student/${out.studentId}/${out.classId}` : `/student/${out.studentId}`);
  }

  return (
    <div className="grid items-start gap-4 md:grid-cols-2">
      <Card eyebrow="Existing student" title="Continue as">
        <div className="flex flex-col gap-1.5" role="list">
          {students.map((s) => (
            <Link key={s.id} href={`/student/${s.id}`} role="listitem" className="flex items-center gap-2.5 rounded-sm border border-line px-2.5 py-2 text-fg-1 no-underline hover:bg-sand-50">
              <Avatar name={s.name} size={28} />
              <span className="type-label min-w-0 flex-1 truncate">{s.name}</span>
              <span className="type-caption text-fg-3">{s.classes === 0 ? "No class yet" : s.classes === 1 ? "1 class" : `${s.classes} classes`}</span>
              <ArrowRight size={14} className="text-fg-3" aria-hidden />
            </Link>
          ))}
          {!students.length && <p className="type-body m-0 text-fg-3">No students yet. Create one.</p>}
        </div>
      </Card>

      <Card eyebrow="New student" title="Create a student">
        <form onSubmit={create} className="flex flex-col gap-3">
          <Input label="Your name" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} autoComplete="off" placeholder="Maya Kim" required />
          <Input label="Join code (optional)" hint="Your teacher’s class code. You can add it later." value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} maxLength={20} className="font-mono uppercase" autoComplete="off" />
          {error && <p role="alert" className="type-caption m-0 text-danger-ink">{error}</p>}
          <div><Button type="submit" disabled={busy || !name.trim()}>{busy ? "Creating…" : "Create student"}</Button></div>
        </form>
      </Card>
    </div>
  );
}
