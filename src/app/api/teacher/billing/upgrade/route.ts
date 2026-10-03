import { upgradeTeacher } from "@/lib/billing/upgrade";
import { errorResponse, requireTeacher } from "@/lib/platform/identity";
import { getServices } from "@/lib/platform/services";

/** "Upgrade": switch this teacher's billing to the configured larger subscription. */
export async function POST() {
  try {
    const teacher = await requireTeacher();
    const { repo } = await getServices();
    const out = await upgradeTeacher(repo, teacher.id);
    return Response.json(out);
  } catch (e) {
    if ((e as Error | undefined)?.name === "UpgradeError") return Response.json({ error: (e as Error).message }, { status: (e as { status: number }).status });
    return errorResponse(e);
  }
}
