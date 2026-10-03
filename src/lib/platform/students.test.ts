import { describe, expect, it } from "vitest";
import { MAX_NAME_LENGTH, normalizeStudentName, StudentError } from "./students";

describe("new student names", () => {
  it("trims and collapses whitespace", () => {
    expect(normalizeStudentName("  Maya   Kim ")).toBe("Maya Kim");
  });
  it("removes control characters", () => {
    expect(normalizeStudentName("Leo\u0000\nPark")).toBe("Leo Park");
  });
  it("keeps non-latin names intact", () => {
    expect(normalizeStudentName("Søren Åberg")).toBe("Søren Åberg");
    expect(normalizeStudentName("李雷")).toBe("李雷");
  });
  it("rejects empty and over-long names", () => {
    expect(() => normalizeStudentName("   ")).toThrow(StudentError);
    expect(() => normalizeStudentName("x".repeat(MAX_NAME_LENGTH + 1))).toThrow(/up to/);
  });
});
