// Content type field visibility and label configuration

export const CONTENT_TYPES = [
  { value: "software", label: "সফটওয়্যার" },
  { value: "android", label: "অ্যান্ড্রয়েড" },
  { value: "game", label: "গেম" },
  { value: "movie", label: "মুভি" },
  { value: "music", label: "মিউজিক" },
  { value: "ebook", label: "ইবুক" },
  { value: "tutorial", label: "টিউটোরিয়াল" },
  { value: "other", label: "অন্যান্য" },
] as const;

export type ContentType = typeof CONTENT_TYPES[number]["value"];

interface FieldConfig {
  showOsType: boolean;
  showVersion: boolean;
  showDeveloper: boolean;
  developerLabel: string;
  showVideoUrl: boolean;
  showDuration: boolean;
}

const fieldConfigs: Record<ContentType, FieldConfig> = {
  software: { showOsType: true, showVersion: true, showDeveloper: true, developerLabel: "ডেভেলপার", showVideoUrl: false, showDuration: false },
  android: { showOsType: true, showVersion: true, showDeveloper: true, developerLabel: "ডেভেলপার", showVideoUrl: false, showDuration: false },
  game: { showOsType: true, showVersion: true, showDeveloper: true, developerLabel: "ডেভেলপার", showVideoUrl: false, showDuration: false },
  movie: { showOsType: false, showVersion: false, showDeveloper: true, developerLabel: "পরিচালক", showVideoUrl: true, showDuration: true },
  music: { showOsType: false, showVersion: false, showDeveloper: true, developerLabel: "আর্টিস্ট", showVideoUrl: false, showDuration: true },
  ebook: { showOsType: false, showVersion: false, showDeveloper: true, developerLabel: "লেখক", showVideoUrl: false, showDuration: false },
  tutorial: { showOsType: false, showVersion: false, showDeveloper: true, developerLabel: "ট্রেইনার", showVideoUrl: true, showDuration: true },
  other: { showOsType: false, showVersion: false, showDeveloper: false, developerLabel: "", showVideoUrl: false, showDuration: false },
};

export function getFieldConfig(contentType: string): FieldConfig {
  return fieldConfigs[contentType as ContentType] || fieldConfigs.other;
}
