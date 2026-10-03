import { flushUsage } from "@/lib/billing/meter";
import { getServices } from "@/lib/platform/services";

/** Retry unsent usage. Call from a cron more often than every few hours: Chargebee only accepts events under 12 hours old. */
export async function POST(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) return Response.json({ error: "Forbidden" }, { status: 403 });
  return Response.json(await flushUsage({ repo: (await getServices()).repo }));
}
