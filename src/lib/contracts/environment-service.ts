/**
 * CONTRACT 2 of 5 — the EnvironmentService interface.
 *
 * Workstream A implements it. Workstreams B (student app), C (teacher app) and
 * D (platform) call it and never import the harness SDK directly.
 *
 * The shape of the boundary is deliberate:
 *
 *   - One `Environment` per (student, class). The sandbox id is derived from
 *     the environment id (`env-<id>`), never passed in by a caller, so a student
 *     cannot address another student's sandbox by crafting a request.
 *   - `runTurn` returns an async stream of `HarnessEvent`s. The student UI
 *     forwards them to the browser; the teacher's channel consumes the same
 *     sequence. One turn, one event sequence, two observers.
 *   - Nothing here exposes resume state. It is encrypted inside the store and
 *     never crosses this boundary in a browser-visible shape.
 *
 * FROZEN after day 1.
 */
import type { EffectivePolicy, PolicyOverride } from "./policy.ts";
import type { HarnessEvent } from "./events.ts";

export type EnvironmentStatus =
  | "created"
  | "resuming"
  | "active"
  | "idle"
  | "detached"
  | "paused"
  | "stopped"
  | "reset"
  | "error";

/** Server-side view of a student's environment. Safe to serialise to the owner. */
export type Environment = {
  id: string;
  classId: string;
  studentId: string;
  /** Derived: `env-<id>`. Present so the UI can show which sandbox is in play. */
  sandboxId: string;
  status: EnvironmentStatus;
  /** Set when `policy_override_json` is non-null. */
  hasOverride: boolean;
  createdAt: string;
  lastActiveAt: string | null;
};

export type RunTurnInput = {
  environmentId: string;
  /** The student's question. */
  prompt: string;
  /**
   * Called on every turn. Must re-read the policy from the store rather than
   * accepting one from the caller — a student must never be able to hand the
   * agent its own permissions.
   */
  resolvePolicy: () => Promise<EffectivePolicy>;
  /**
   * Notes the teacher injected since the last turn. Appended as context so the
   * tutor can respond to them.
   */
  teacherNotes?: readonly { text: string; teacherName: string }[];
  /**
   * Called when the tutor wants to run a gated tool. Returning `false` denies
   * it and the reason is fed back to the tutor. The default denies, so a
   * misconfigured gate fails closed.
   */
  requestApproval?: (request: ApprovalRequest) => Promise<ApprovalDecision>;
  abortSignal?: AbortSignal;
};

export type ApprovalRequest = {
  approvalId: string;
  toolCallId: string;
  toolName: string;
  input: unknown;
};

export type ApprovalDecision = { approved: boolean; reason?: string; teacherId?: string };

/** A single file in a student's sandbox, as shown in the teacher's file view. */
export type SandboxFile = {
  path: string;
  size: number;
  /** Truncated for transport; the teacher view fetches contents on demand. */
  preview: string;
};

export type SandboxTree = {
  root: string;
  files: SandboxFile[];
  /** Total bytes, for the "how much has this student written" stat. */
  totalBytes: number;
};

export interface EnvironmentService {
  /**
   * Create the environment record and its sandbox. Idempotent on
   * (classId, studentId): calling it twice returns the same environment.
   */
  ensureEnvironment(input: {
    classId: string;
    studentId: string;
  }): Promise<Environment>;

  /**
   * Attach to the environment's sandbox, resuming the runtime's conversation
   * history from the stored resume state. Cheap when already warm.
   */
  resume(environmentId: string): Promise<Environment>;

  /**
   * Leave the sandbox running and persist resume state. Called on idle so the
   * next student turn is fast and the cost is bounded by an explicit timeout
   * rather than by luck.
   */
  detach(environmentId: string): Promise<void>;

  /** Persist resume state and stop the runtime. Used by pause and by reaping. */
  stop(environmentId: string): Promise<void>;

  /** Teacher pause: blocks new turns and saves state. `unpause` reverses it. */
  pause(environmentId: string): Promise<void>;
  unpause(environmentId: string): Promise<void>;

  /** Destroy the sandbox and start a clean environment. History is kept. */
  reset(environmentId: string): Promise<Environment>;

  /**
   * Run exactly one student turn. Resolves once the turn ends; the stream
   * carries every event the turn produced, including the terminal `turn-end`.
   *
   * Throws `EnvironmentPausedError` when the teacher has paused the student.
   */
  runTurn(input: RunTurnInput): AsyncIterable<HarnessEvent>;

  /** Read the student's sandbox file tree for the teacher. */
  readSandboxTree(environmentId: string): Promise<SandboxTree>;

  /** Read one file's contents from the student's sandbox. */
  readSandboxFile(environmentId: string, path: string): Promise<string>;

  /** Replace this student's policy override. Pass `null` to clear it. */
  setPolicyOverride(
    environmentId: string,
    override: PolicyOverride | null,
  ): Promise<void>;
}

export class EnvironmentPausedError extends Error {
  constructor(public readonly environmentId: string) {
    super("This environment is paused by the teacher.");
    this.name = "EnvironmentPausedError";
  }
}

export class EnvironmentLimitError extends Error {
  constructor(
    public readonly limit: "turnsPerDay" | "maxTokensPerTurn",
    message: string,
  ) {
    super(message);
    this.name = "EnvironmentLimitError";
  }
}

export class SandboxAccessError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SandboxAccessError";
  }
}

/**
 * Derive the sandbox id for an environment. Deterministic and one-directional:
 * the sandbox id can be computed from the environment id, but the environment
 * id cannot be recovered from a sandbox id alone — ownership is always checked
 * against the store before a sandbox is touched.
 */
export function deriveSandboxId(environmentId: string): string {
  return `env-${environmentId}`;
}