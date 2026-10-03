import type { TurnDriver } from "./driver.ts";
import { LocalDriver } from "./local-driver.ts";

/**
 * Choose the driver from env. The harness driver is imported lazily so the
 * experimental harness packages are only loaded when actually selected.
 */
export async function createDriver(): Promise<TurnDriver> {
  if (process.env.HARNESS_ADAPTER === "claude-code") {
    const { HarnessDriver } = await import("./harness-driver.ts");
    return new HarnessDriver();
  }
  return new LocalDriver();
}
