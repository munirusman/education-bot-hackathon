import type { RealtimeBus } from "@/lib/contracts";

/**
 * In-process pub/sub, shared across route handlers via globalThis. Fine for a
 * single web process (the demo default, REALTIME_DRIVER=sse). For multi-process
 * deployments implement RealtimeBus over Redis/Ably and swap it in services.ts.
 */
export function createMemoryBus(): RealtimeBus {
  const topics = new Map<string, Set<(m: unknown) => void>>();
  return {
    publish(topic, message) {
      for (const l of topics.get(topic) ?? []) {
        try {
          l(message);
        } catch {
          /* a broken subscriber must not break the student's stream */
        }
      }
    },
    subscribe(topic, listener) {
      let set = topics.get(topic);
      if (!set) topics.set(topic, (set = new Set()));
      set.add(listener);
      return () => {
        set.delete(listener);
        if (!set.size) topics.delete(topic);
      };
    },
  };
}
