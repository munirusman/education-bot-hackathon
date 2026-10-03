"use client";
import { useRouter } from "next/navigation";
import { Rocket } from "lucide-react";
import { useState } from "react";
import { Button } from "../orbit/core";
import { useToast } from "../orbit/feedback";

export function UpgradeButton({ label = "Upgrade" }: { label?: string }) {
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  return (
    <Button
      size="sm"
      icon={Rocket}
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        const res = await fetch("/api/teacher/billing/upgrade", { method: "POST" });
        const out = await res.json().catch(() => ({}));
        setBusy(false);
        if (!res.ok) return toast(out.error ?? "Couldn’t upgrade", "warning");
        toast("Upgraded. Your students’ tutors are back on.");
        router.refresh();
      }}
    >
      {label}
    </Button>
  );
}
