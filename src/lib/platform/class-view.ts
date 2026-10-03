import { loadDashboard } from "./dashboard.ts";
import { resolveEffectivePolicy } from "./policy.ts";
import type { Services } from "./services.ts";

/** Everything the live classroom needs, shared by the class page and the drill-in. */
export async function loadClassView({ repo }: Services, classId: string, activePolicyId: string | null) {
  const [dashboard, flags, approvals, policy] = await Promise.all([
    loadDashboard(repo, classId),
    repo.listFlags(classId),
    repo.listPendingApprovalsForClass(classId),
    repo.getActivePolicy(classId),
  ]);
  const testMode = resolveEffectivePolicy({ classPolicy: policy, classPolicyId: activePolicyId ?? classId, override: null }).assessmentActive;
  const online = dashboard.tiles.filter((t) => t.online).length;
  const total = dashboard.tiles.length + dashboard.notStarted.length;
  return { data: { ...dashboard, flags, approvals }, policy, testMode, online, total };
}
