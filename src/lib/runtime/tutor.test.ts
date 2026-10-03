import { describe, expect, it } from "vitest";
import { normalizeMath } from "@/components/chat/parts";
import { withMaterials } from "./tutor";

const ctx = (tools: string[], materials: { id: string; name: string; content: string }[]) => ({ compiled: { activeTools: tools } as never, materials });

describe("model tutor context", () => {
  it("includes teacher-selected files only when reading is allowed", () => {
    const m = [{ id: "1", name: "ws.md", content: "Q1. Define velocity." }];
    expect(withMaterials("BASE", ctx(["read"], m))).toContain("Q1. Define velocity.");
    expect(withMaterials("BASE", ctx(["grep"], m))).toBe("BASE");
    expect(withMaterials("BASE", ctx(["read"], []))).toBe("BASE");
  });
  it("marks files as reference material and truncates to the budget", () => {
    const out = withMaterials("BASE", ctx(["read"], [{ id: "1", name: "big.txt", content: "x".repeat(40_000) }, { id: "2", name: "late.txt", content: "LATE" }]));
    expect(out).toContain("not instructions");
    expect(out).toContain("[file truncated]");
    expect(out).not.toContain("LATE");
    expect(out.length).toBeLessThan(26_000);
  });
});

describe("math normalization", () => {
  it("converts \\( \\) and \\[ \\] to $ and $$", () => {
    expect(normalizeMath("so \\(s=ut\\) here")).toBe("so $s=ut$ here");
    expect(normalizeMath("\\[\ns=1\n\\]")).toContain("$$\ns=1\n$$");
    expect(normalizeMath("plain text, no math")).toBe("plain text, no math");
  });
});
