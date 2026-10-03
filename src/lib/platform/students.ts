export const MAX_STUDENTS = 200; // demo guard: anyone can create a student, so cap it
export const MAX_NAME_LENGTH = 60;

export class StudentError extends Error {}

/** Trim, collapse whitespace, drop control characters; reject empty or over-long names. */
export function normalizeStudentName(raw: string): string {
  const name = raw.normalize("NFKC").replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim();
  if (!name) throw new StudentError("Enter a name.");
  if (name.length > MAX_NAME_LENGTH) throw new StudentError(`Names can be up to ${MAX_NAME_LENGTH} characters.`);
  return name;
}
