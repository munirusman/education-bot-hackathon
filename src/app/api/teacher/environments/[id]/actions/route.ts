import { classTopic, envTopic, teacherActionSchema, type HarnessEvent } from "@/lib/contracts";
import { newId } from "@/lib/db/repo";
import { errorResponse, requireTeacherOf } from "@/lib/platform/identity";
import { getServices } from "@/lib/platform/services";

/** Contract 5: every teacher intervention goes through here and is audited. */
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const { user, env } = await requireTeacherOf(id);
    const action = teacherActionSchema.parse(await req.json());
    const { repo, env: envService, broker, bus } = await getServices();
    const log = (payload: unknown = {}) => repo.logTeacherAction({ environmentId: id, teacherId: user.id, action: action.action, payload });

    switch (action.action) {
      case "pause":
        await envService.pause(id);
        await log();
        break;
      case "resume":
        await envService.unpause(id);
        await log();
        break;
      case "note": {
        const noteId = newId("note");
        const event: HarnessEvent = {
          type: "teacher-note",
          seq: 0,
          at: new Date().toISOString(),
          noteId,
          teacherId: user.id,
          teacherName: user.name,
          text: action.text,
          visibleToStudent: true,
        };
        await repo.appendEvent(id, null, event);
        await log({ text: action.text, teacherName: user.name, noteId });
        bus.publish(envTopic(id), event);
        break;
      }
      case "approve": {
        const approval = await repo.getApproval(action.approvalId);
        if (!approval || approval.environmentId !== id) return Response.json({ error: "Not found" }, { status: 404 });
        const live = await broker.resolve(action.approvalId, { approved: action.approved, reason: action.reason, teacherId: user.id });
        await log({ approvalId: action.approvalId, approved: action.approved, reason: action.reason });
        if (!live) return Response.json({ error: "That request has expired" }, { status: 409 });
        break;
      }
      case "override":
        await envService.setPolicyOverride(id, action.override && Object.keys(action.override).length ? action.override : null);
        await log({ override: action.override });
        break;
      case "reset":
        await envService.reset(id);
        await log();
        break;
      case "view":
        await log();
        break;
    }
    bus.publish(classTopic(env.classId), { type: "tile", environmentId: id });
    return Response.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
