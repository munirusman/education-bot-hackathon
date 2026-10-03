import { getServices } from "@/lib/platform/services";

/** Detach environments idle past IDLE_MINUTES (default 15). Call from a cron. */
export async function POST(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) return Response.json({ error: "Forbidden" }, { status: 403 });
  const minutes = Number(process.env.IDLE_MINUTES ?? 15);
  const detached = await (await getServices()).env.reapIdle(minutes * 60_000);
  return Response.json({ detached });
}
