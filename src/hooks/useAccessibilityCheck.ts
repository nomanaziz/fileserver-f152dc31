import { useState, useEffect, useRef, useCallback } from "react";

type LinkStatus = "checking" | "online" | "offline";

const BATCH_SIZE = 5;
const TIMEOUT_MS = 5000;
const CACHE_KEY = "bdix-link-statuses";
const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

interface CachedData {
  timestamp: number;
  statuses: Record<string, LinkStatus>;
}

function loadCache(links: string[]): Map<string, LinkStatus> | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cached: CachedData = JSON.parse(raw);
    if (Date.now() - cached.timestamp > CACHE_EXPIRY_MS) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    // Only use cache if all requested links are present
    const map = new Map<string, LinkStatus>();
    for (const link of links) {
      const s = cached.statuses[link];
      if (!s) return null;
      map.set(link, s);
    }
    return map;
  } catch {
    return null;
  }
}

function saveCache(statuses: Map<string, LinkStatus>) {
  try {
    const obj: Record<string, LinkStatus> = {};
    statuses.forEach((v, k) => {
      if (v !== "checking") obj[k] = v;
    });
    const data: CachedData = { timestamp: Date.now(), statuses: obj };
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    // ignore quota errors
  }
}

export function useAccessibilityCheck(links: string[]) {
  const [statuses, setStatuses] = useState<Map<string, LinkStatus>>(new Map());
  const [isFromCache, setIsFromCache] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const [recheckTrigger, setRecheckTrigger] = useState(0);
  const linksKey = links.join(",");

  const runChecks = useCallback((forceRefresh: boolean) => {
    if (links.length === 0) return;

    // Try cache first (unless forced)
    if (!forceRefresh) {
      const cached = loadCache(links);
      if (cached) {
        setStatuses(cached);
        setIsFromCache(true);
        return;
      }
    }

    setIsFromCache(false);
    const controller = new AbortController();
    abortRef.current = controller;

    const initial = new Map<string, LinkStatus>();
    links.forEach((l) => initial.set(l, "checking"));
    setStatuses(new Map(initial));

    const results = new Map<string, LinkStatus>(initial);

    const checkLink = async (url: string) => {
      const linkController = new AbortController();
      const linkTimeout = setTimeout(() => linkController.abort(), TIMEOUT_MS);
      const onParentAbort = () => linkController.abort();
      controller.signal.addEventListener("abort", onParentAbort);

      try {
        await fetch(url, {
          mode: "no-cors",
          signal: linkController.signal,
          cache: "no-store",
        });
        clearTimeout(linkTimeout);
        if (!controller.signal.aborted) {
          results.set(url, "online");
          setStatuses((prev) => {
            const next = new Map(prev);
            next.set(url, "online");
            return next;
          });
        }
      } catch {
        clearTimeout(linkTimeout);
        if (!controller.signal.aborted) {
          results.set(url, "offline");
          setStatuses((prev) => {
            const next = new Map(prev);
            next.set(url, "offline");
            return next;
          });
        }
      } finally {
        controller.signal.removeEventListener("abort", onParentAbort);
      }
    };

    const runBatches = async () => {
      for (let i = 0; i < links.length; i += BATCH_SIZE) {
        if (controller.signal.aborted) break;
        const batch = links.slice(i, i + BATCH_SIZE);
        await Promise.allSettled(batch.map(checkLink));
        // Throttle: 500ms delay between batches to reduce RAM/CPU pressure
        if (!controller.signal.aborted && i + BATCH_SIZE < links.length) {
          await new Promise(r => setTimeout(r, 500));
        }
      }
      if (!controller.signal.aborted) {
        saveCache(results);
      }
    };

    runBatches();

    return () => {
      controller.abort();
    };
  }, [linksKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const cleanup = runChecks(recheckTrigger > 0);
    return cleanup;
  }, [linksKey, recheckTrigger, runChecks]); // eslint-disable-line react-hooks/exhaustive-deps

  const recheck = useCallback(() => {
    localStorage.removeItem(CACHE_KEY);
    abortRef.current?.abort();
    setRecheckTrigger((t) => t + 1);
  }, []);

  return { statuses, recheck, isFromCache };
}
