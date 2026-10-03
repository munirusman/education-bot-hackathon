"use client";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { Button } from "../orbit/core";
import { useToast } from "../orbit/feedback";

export function SyncUsageButton({ disabled }: { disabled?: boolean }) {
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  return (
    <Button
      size="sm"
      variant="secondary"
      icon={RefreshCw}
      disabled={busy || disabled}
      onClick={async () => {
        setBusy(true);
        const res = await fetch("/api/teacher/billing/sync", { method: "POST" });
        const out = await res.json().catch(() => ({}));
        setBusy(false);
        if (!res.ok) return toast("Couldn’t sync usage", "warning");
        const bits = [out.sent && `${out.sent} sent`, out.retrying && `${out.retrying} will retry`, out.failed && `${out.failed} refused`, out.expired && `${out.expired} too old`].filter(Boolean);
        toast(bits.length ? `Usage synced: ${bits.join(", ")}` : "Everything is up to date");
        router.refresh();
      }}
    >
      Sync now
    </Button>
  );
}
