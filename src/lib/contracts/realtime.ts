/**
 * CONTRACT 4 of 5 — realtime topic naming and payloads.
 *
 * `env:<environmentId>` carries every HarnessEvent for one student's
 * environment, in order. The student's chat route publishes as it streams; the
 * teacher drill-in subscribes. `class:<classId>` carries lightweight dashboard
 * updates (tile refreshes and new flags) so the grid needs no polling.
 */
import type { HarnessEvent } from "./events.ts";

export const envTopic = (environmentId: string) => `env:${environmentId}`;
export const classTopic = (classId: string) => `class:${classId}`;

export type EnvMessage = { topic: string; event: HarnessEvent };

export type ClassMessage =
  | { type: "tile"; environmentId: string }
  | { type: "flag"; environmentId: string; flagId: string; kind: string; urgent: boolean }
  | { type: "approval"; environmentId: string; approvalId: string };

export interface RealtimeBus {
  publish(topic: string, message: unknown): void;
  subscribe(topic: string, listener: (message: unknown) => void): () => void;
}
