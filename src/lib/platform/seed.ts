import type { Repo } from "@/lib/db/repo.ts";

export const DEMO = {
  teacher: { id: "usr_rivera", name: "Ms. Rivera", role: "teacher" as const },
  students: [
    { id: "usr_ava", name: "Ava Chen", role: "student" as const },
    { id: "usr_ben", name: "Ben Okafor", role: "student" as const },
    { id: "usr_chloe", name: "Chloe Martin", role: "student" as const },
    { id: "usr_dev", name: "Dev Patel", role: "student" as const },
  ],
};

const WORKSHEET = `Unit 3 worksheet: Kinematics

1. A cart accelerates uniformly from rest at 2.0 m/s^2 for 5.0 s. How far does it travel?
2. A ball is thrown upward at 12 m/s. How long until it reaches its highest point?
3. Sketch a velocity-time graph for a car that speeds up, cruises, then brakes.
`;

/** Idempotent demo data so a fresh checkout has a class to look at. */
export async function seedDemo(repo: Repo) {
  const existing = await repo.listUsers("teacher");
  if (existing.length) return;
  await repo.upsertUser(DEMO.teacher);
  for (const s of DEMO.students) await repo.upsertUser(s);
  const cls = await repo.createClass({
    teacherId: DEMO.teacher.id,
    name: "Grade 11 Physics",
    policy: {
      name: "Unit 3 tutoring",
      subject: "Grade 11 physics",
      unit: "Unit 3: kinematics",
      style: "guided-steps",
      tools: { read: true, write: true, bash: false },
      materials: [],
      approvalRequired: ["write"],
      model: "default",
      limits: { turnsPerDay: 40, maxTokensPerTurn: 4000 },
      assessmentWindow: null,
      teacherTools: [],
      guidance: "Encourage students to draw a diagram before using any equation.",
    },
  });
  const matId = await repo.addMaterial({ classId: cls.id, name: "unit3-worksheet.md", content: WORKSHEET });
  const policy = await repo.getActivePolicy(cls.id);
  const { version: _v, ...rest } = policy;
  await repo.savePolicy(cls.id, { ...rest, materials: [matId] });
  for (const s of DEMO.students) await repo.enroll(cls.id, s.id);
}
