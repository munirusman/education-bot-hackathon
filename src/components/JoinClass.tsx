"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function JoinClass() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  return (
    <form
      className="flex gap-2"
      onSubmit={async (e) => {
        e.preventDefault();
        const res = await fetch("/api/student/join", { method: "POST", body: JSON.stringify({ code }) });
        if (!res.ok) return setError((await res.json()).error ?? "Could not join");
        const { classId } = await res.json();
        router.push(`/student/${classId}`);
      }}
    >
      <input className="input max-w-40 uppercase" placeholder="Join code" value={code} onChange={(e) => setCode(e.target.value)} />
      <button className="btn btn-primary">Join</button>
      {error && <span className="self-center text-sm text-red-600">{error}</span>}
    </form>
  );
}
