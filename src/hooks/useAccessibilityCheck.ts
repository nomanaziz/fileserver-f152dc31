import { useState, useEffect, useRef } from "react";

type LinkStatus = "checking" | "online" | "offline";

const BATCH_SIZE = 5;
const TIMEOUT_MS = 5000;

export function useAccessibilityCheck(links: string[]) {
  const [statuses, setStatuses] = useState<Map<string, LinkStatus>>(new Map());
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (links.length === 0) return;

    const controller = new AbortController();
    abortRef.current = controller;

    // Initialize all as checking
    const initial = new Map<string, LinkStatus>();
    links.forEach((l) => initial.set(l, "checking"));
    setStatuses(new Map(initial));

    const checkLink = async (url: string) => {
      try {
        const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
        await fetch(url, {
          mode: "no-cors",
          signal: controller.signal,
          cache: "no-store",
        });
        clearTimeout(timeoutId);
        if (!controller.signal.aborted) {
          setStatuses((prev) => {
            const next = new Map(prev);
            next.set(url, "online");
            return next;
          });
        }
      } catch {
        if (!controller.signal.aborted) {
          setStatuses((prev) => {
            const next = new Map(prev);
            next.set(url, "offline");
            return next;
          });
        }
      }
    };

    const runBatches = async () => {
      for (let i = 0; i < links.length; i += BATCH_SIZE) {
        if (controller.signal.aborted) break;
        const batch = links.slice(i, i + BATCH_SIZE);
        await Promise.allSettled(batch.map(checkLink));
      }
    };

    runBatches();

    return () => {
      controller.abort();
    };
  }, [links.join(",")]); // eslint-disable-line react-hooks/exhaustive-deps

  return statuses;
}
