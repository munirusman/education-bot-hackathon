"use client";
import { useEffect, useRef } from "react";

/** Subscribe to an SSE topic and call `onMessage` (debounced for bursts of events). */
export function useEventSource(url: string, onMessage: (data: any) => void, debounceMs = 0) {
  const cb = useRef(onMessage);
  cb.current = onMessage;
  useEffect(() => {
    const es = new EventSource(url);
    let t: ReturnType<typeof setTimeout> | undefined;
    es.onmessage = (ev) => {
      const data = JSON.parse(ev.data);
      if (!debounceMs) return cb.current(data);
      clearTimeout(t);
      t = setTimeout(() => cb.current(data), debounceMs);
    };
    return () => {
      clearTimeout(t);
      es.close();
    };
  }, [url, debounceMs]);
}
