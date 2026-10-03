/**
 * CONTRACT 5 of 5 — REST API for teacher actions.
 *
 * One POST route per environment: /api/teacher/environments/:id/actions with a
 * discriminated body. Every action is written to teacher_actions.
 */
import { z } from "zod";
import { policyOverrideSchema, policySchema } from "./policy.ts";

export const teacherActionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("pause") }),
  z.object({ action: z.literal("resume") }),
  z.object({ action: z.literal("note"), text: z.string().min(1).max(1000) }),
  z.object({
    action: z.literal("approve"),
    approvalId: z.string(),
    approved: z.boolean(),
    reason: z.string().max(500).optional(),
  }),
  z.object({
    action: z.literal("override"),
    override: policyOverrideSchema.nullable(),
  }),
  z.object({ action: z.literal("reset"), confirm: z.literal(true) }),
  z.object({ action: z.literal("view") }),
]);
export type TeacherAction = z.infer<typeof teacherActionSchema>;

export const policyUpdateSchema = z.object({ policy: policySchema.omit({ version: true }) });
export type PolicyUpdate = z.infer<typeof policyUpdateSchema>;

export const chatRequestSchema = z.object({
  /** The environment id. Ownership is verified server-side on every request. */
  id: z.string(),
  messages: z.array(z.object({ role: z.string(), parts: z.array(z.unknown()).optional() }).passthrough()),
});
