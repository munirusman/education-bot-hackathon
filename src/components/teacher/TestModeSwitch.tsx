"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Policy } from "@/lib/contracts";
import { Badge } from "../orbit/core";
import { Switch } from "../orbit/forms";
import { useToast } from "../orbit/feedback";

/**
 * Orbit's top-bar Test mode. Turning it on saves a new policy version with an
 * open-ended assessment lock (clarify only, no tools); turning it off clears it.
 */
export function TestModeSwitch({ classId, policy, active }: { classId: string; policy: Policy; active: boolean }) {
  const router = useRouter();
  const toast = useToast();
  const [on, setOn] = useState(active);
  const [busy, setBusy] = useState(false);

  async function set(next: boolean) {
    setBusy(true);
    const { version: _v, ...rest } = policy;
    const assessmentWindow = next ? { startsAt: new Date().toISOString(), style: "hint-only" as const, lockedTools: [], clarifyOnly: true } : null;
    const res = await fetch(`/api/teacher/classes/${classId}/policy`, { method: "PUT", body: JSON.stringify({ policy: { ...rest, assessmentWindow } }) });
    setBusy(false);
    if (!res.ok) return toast("Couldn’t change test mode", "warning");
    setOn(next);
    toast(next ? "Test mode on. Tutors will only clarify questions." : "Test mode off");
    router.refresh();
  }

  return (
    <div className="flex items-center gap-3.5">
      {on && <Badge tone="teacher">Test mode on</Badge>}
      <Switch checked={on} onChange={set} disabled={busy} label="Test mode" />
    </div>
  );
}
