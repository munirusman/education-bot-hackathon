import type { ApprovalDecision, ApprovalRequest, EffectivePolicy, HarnessEvent, SandboxTree } from "@/lib/contracts";
import type { EnvRow } from "@/lib/db/repo.ts";
import type { CompiledTurn } from "./compile.ts";
import type { SandboxFs } from "./sandbox.ts";

/** An event as a driver produces it; the service stamps seq and time. */
export type DriverEvent = HarnessEvent extends infer E ? (E extends unknown ? Omit<E, "seq" | "at"> : never) : never;

export type TurnContext = {
  env: EnvRow;
  turnId: string;
  prompt: string;
  policy: EffectivePolicy;
  compiled: CompiledTurn;
  materials: { id: string; name: string; content: string }[];
  teacherNotes: readonly { text: string; teacherName: string }[];
  requestApproval: (req: ApprovalRequest) => Promise<ApprovalDecision>;
  /** Decrypted opaque state from the last detach/stop/turn, or null. */
  resumeState: unknown;
  /** Called by the driver whenever it has newer resume state to persist. */
  saveResume: (state: unknown) => Promise<void>;
  abortSignal: AbortSignal;
};

/**
 * The seam to whatever actually runs the agent. The service owns policy,
 * persistence, limits and realtime; a driver only turns one prompt into events.
 * The harness SDK is imported in exactly one driver, so it can be swapped.
 */
export interface TurnDriver {
  readonly mode: "local" | "harness";
  runTurn(ctx: TurnContext): AsyncIterable<DriverEvent>;
  /** Park the session, keeping the sandbox. Returns resume state to persist. */
  detach(env: EnvRow, resume: unknown): Promise<unknown>;
  /** Persist state and stop the runtime. */
  stop(env: EnvRow, resume: unknown): Promise<unknown>;
  destroy(env: EnvRow): Promise<void>;
  readTree(env: EnvRow): Promise<SandboxTree>;
  readFile(env: EnvRow, path: string): Promise<string>;
}

export type { SandboxFs };
