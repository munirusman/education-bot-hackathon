import { z } from "zod";
import { defaultPolicy } from "@/lib/contracts";
import { errorResponse, requireTeacher } from "@/lib/platform/identity";
import { getServices } from "@/lib/platform/services";

export async function POST(req: Request) {
  try {
    const user = await requireTeacher();
    const { name, subject } = z.object({ name: z.string().min(1).max(120), subject: z.string().min(1).max(200) }).parse(await req.json());
    const { repo } = await getServices();
    const { version: _v, ...policy } = defaultPolicy({ subject });
    const cls = await repo.createClass({ teacherId: user.id, name, policy });
    return Response.json({ id: cls.id, joinCode: cls.joinCode });
  } catch (e) {
    return errorResponse(e);
  }
}
