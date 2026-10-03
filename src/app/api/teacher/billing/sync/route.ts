import { flushUsage } from "@/lib/billing/meter";
import { errorResponse, requireTeacher } from "@/lib/platform/identity";
import { getServices } from "@/lib/platform/services";

/** "Sync now": send any usage still waiting to Chargebee. Idempotent: events carry stable deduplication ids. */
export async function POST() {
  try {
    const teacher = await requireTeacher();
    const { repo } = await getServices();
    const result = await flushUsage({ repo });
    return Response.json({ ...result, counts: await repo.usageSyncCounts(teacher.id) });
  } catch (e) {
    return errorResponse(e);
  }
}
