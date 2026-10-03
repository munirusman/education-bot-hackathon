"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Card } from "../orbit/core";
import { Input } from "../orbit/forms";

export function CreateClass() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [error, setError] = useState("");
  return (
    <Card eyebrow="New class" title="Set up a class">
      <form
        className="flex flex-wrap items-end gap-3"
        onSubmit={async (e) => {
          e.preventDefault();
          const res = await fetch("/api/teacher/classes", { method: "POST", body: JSON.stringify({ name, subject }) });
          const body = await res.json();
          if (!res.ok) return setError(body.error);
          router.push(`/teacher/${body.id}/policy`);
        }}
      >
        <div className="w-56"><Input label="Class name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Period 3 · Algebra I" required /></div>
        <div className="w-56"><Input label="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Grade 9 maths" required /></div>
        <Button type="submit" disabled={!name.trim() || !subject.trim()}>Create class</Button>
      </form>
      {error && <p className="type-caption text-danger-ink">{error}</p>}
    </Card>
  );
}
