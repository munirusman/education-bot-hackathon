"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Card } from "./orbit/core";
import { Input } from "./orbit/forms";

export function JoinClass() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  return (
    <Card eyebrow="Join a class" title="Enter the code your teacher gave you">
      <form
        className="flex items-start gap-2"
        onSubmit={async (e) => {
          e.preventDefault();
          setError("");
          const res = await fetch("/api/student/join", { method: "POST", body: JSON.stringify({ code }) });
          if (!res.ok) return setError((await res.json()).error ?? "That code didn’t work.");
          router.push(`/student/${(await res.json()).classId}`);
        }}
      >
        <div className="w-40">
          <Input aria-label="Join code" placeholder="Join code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} error={error || undefined} className="font-mono uppercase" />
        </div>
        <Button type="submit" disabled={!code.trim()}>Join class</Button>
      </form>
    </Card>
  );
}
