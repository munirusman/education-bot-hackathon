import { describe, expect, it } from "vitest";
import { MAX_MATERIAL_BYTES, MaterialError, safeFileName, validateMaterial } from "./materials";

const bytes = (s: string) => new TextEncoder().encode(s);

describe("material uploads", () => {
  it("accepts a text file and keeps its content", () => {
    expect(validateMaterial("Week 4 notes.md", bytes("# Hi"))).toEqual({ name: "Week-4-notes.md", content: "# Hi" });
  });
  it("strips directories so a name cannot escape the materials folder", () => {
    expect(safeFileName("../../etc/passwd.txt")).toBe("passwd.txt");
    expect(safeFileName("C:\\evil\\..\\x.txt")).toBe("x.txt");
    expect(safeFileName(".hidden.txt")).toBe("hidden.txt");
  });
  it("rejects non-text formats, empty, oversize, binary and non-UTF-8 files", () => {
    expect(() => validateMaterial("exam.pdf", bytes("%PDF"))).toThrow(MaterialError);
    expect(() => validateMaterial("a.txt", bytes(""))).toThrow(/empty/);
    expect(() => validateMaterial("a.txt", new Uint8Array(MAX_MATERIAL_BYTES + 1).fill(97))).toThrow(/larger/);
    expect(() => validateMaterial("a.txt", bytes("a\u0000b"))).toThrow(/binary/);
    expect(() => validateMaterial("a.txt", new Uint8Array([0xff, 0xfe, 0xfd]))).toThrow(/UTF-8/);
  });
  it("rejects a double extension that ends in an executable-looking type", () => {
    expect(() => validateMaterial("notes.txt.exe", bytes("x"))).toThrow(MaterialError);
  });
});
