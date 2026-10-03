"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function CreateClass() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [error, setError] = useState("");
  return (
    <form
      className="card flex flex-wrap items-end gap-3"
      onSubmit={async (e) => {
        e.preventDefault();
        const res = await fetch("/api/teacher/classes", { method: "POST", body: JSON.stringify({ name, subject }) });
        const body = await res.json();
        if (!res.ok) return setError(body.error);
        router.push(`/teacher/${body.id}/policy`);
      }}
    >
      <div><label className="label">Class name</label><input className="input" value={name} onChange={(e) => setName(e.target.value)} required /></div>
      <div><label className="label">Subject</label><input className="input" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Grade 9 maths" required /></div>
      <button className="btn btn-primary">Create class</button>
      {error && <span className="text-sm text-red-600">{error}</span>}
    </form>
  );
}
