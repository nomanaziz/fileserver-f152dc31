import { useMemo } from "react";

export type DetectedPlatform = "android" | "windows" | "mac" | "ios" | "linux" | "unknown";

const platformKeywords: Record<string, string[]> = {
  android: ["android", "apk", "mobile"],
  windows: ["windows", "software", "pc"],
  mac: ["mac", "macos", "apple"],
  ios: ["ios", "iphone", "ipad"],
  linux: ["linux", "ubuntu"],
};

export function detectPlatform(ua: string): DetectedPlatform {
  const l = ua.toLowerCase();
  if (/android/i.test(l)) return "android";
  if (/iphone|ipad|ipod/i.test(l)) return "ios";
  if (/macintosh|mac os/i.test(l)) return "mac";
  if (/windows/i.test(l)) return "windows";
  if (/linux/i.test(l)) return "linux";
  return "unknown";
}

export function useDevicePlatform(): DetectedPlatform {
  return useMemo(() => detectPlatform(navigator.userAgent), []);
}

export function matchesPlatform(categorySlug: string | null | undefined, platform: DetectedPlatform): boolean {
  if (!categorySlug || platform === "unknown") return false;
  const keywords = platformKeywords[platform] || [];
  const slug = categorySlug.toLowerCase();
  return keywords.some((kw) => slug.includes(kw));
}

export function getPlatformLabel(platform: DetectedPlatform): string {
  const labels: Record<DetectedPlatform, string> = {
    android: "Android",
    windows: "Windows",
    mac: "Mac",
    ios: "iOS",
    linux: "Linux",
    unknown: "",
  };
  return labels[platform];
}
