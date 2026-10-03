import { getServices } from "@/lib/platform/services";

export async function loadPickerStudents() {
  const { repo } = await getServices();
  const students = await repo.listUsers("student");
  return Promise.all(students.map(async (s) => ({ id: s.id, name: s.name, classes: (await repo.listClassesForStudent(s.id)).length })));
}
