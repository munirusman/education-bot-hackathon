import { classTopic, type ApprovalDecision, type ApprovalRequest, type RealtimeBus } from "@/lib/contracts";
import type { Repo } from "@/lib/db/repo.ts";

const TIMEOUT_MS = 10 * 60_000;

/**
 * Bridges a student's paused turn and the teacher's approve/deny click. The
 * turn awaits `request`; the teacher action route calls `resolve`. Fails closed:
 * timeout, abort and unknown approvals all deny.
 */
export function createApprovalBroker(repo: Repo, bus: RealtimeBus) {
  const waiting = new Map<string, (d: ApprovalDecision) => void>();

  return {
    request(env: { id: string; classId: string }, req: ApprovalRequest, signal?: AbortSignal): Promise<ApprovalDecision> {
      return new Promise<ApprovalDecision>((resolve) => {
        let timer: ReturnType<typeof setTimeout>;
        const done = async (d: ApprovalDecision) => {
          clearTimeout(timer);
          waiting.delete(req.approvalId);
          await repo.resolveApproval(req.approvalId, d.approved, d.reason);
          bus.publish(classTopic(env.classId), { type: "tile", environmentId: env.id });
          resolve(d);
        };
        waiting.set(req.approvalId, (d) => void done(d));
        timer = setTimeout(() => void done({ approved: false, reason: "No teacher responded in time." }), TIMEOUT_MS);
        signal?.addEventListener("abort", () => void done({ approved: false, reason: "The turn was cancelled." }));
        void repo
          .createApproval({ id: req.approvalId, environmentId: env.id, turnId: null, toolCallId: req.toolCallId, toolName: req.toolName, input: req.input })
          .then(() => bus.publish(classTopic(env.classId), { type: "approval", environmentId: env.id, approvalId: req.approvalId }));
      });
    },
    /** Returns false when nothing is waiting (already decided, or process restarted). */
    async resolve(approvalId: string, decision: ApprovalDecision): Promise<boolean> {
      const w = waiting.get(approvalId);
      if (!w) {
        await repo.resolveApproval(approvalId, false, "expired");
        return false;
      }
      w(decision);
      return true;
    },
  };
}
