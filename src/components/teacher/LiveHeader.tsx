import type { Policy } from "@/lib/contracts";
import { TestModeSwitch } from "./TestModeSwitch";
import { TopBar } from "./TeacherShell";

export function LiveHeader({ classId, policy, testMode, online, total }: { classId: string; policy: Policy; testMode: boolean; online: number; total: number }) {
  return (
    <TopBar title="Live classroom">
      <span className="type-caption inline-flex items-center gap-1.5 text-working-ink">
        <span className="size-[7px] rounded-full bg-working" />
        Live · {online} of {total} active
      </span>
      <div className="ml-auto"><TestModeSwitch classId={classId} policy={policy} active={testMode} /></div>
    </TopBar>
  );
}
