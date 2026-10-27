"use client";

import { useSiteData } from "@deneb-ui/ui";
import type initialSiteData from "@/data/site-data.json";

export type VanguardData = typeof initialSiteData;
export type VehicleId = keyof VanguardData["content"]["cards"]["vehicles"];

export function useSiteContent() {
  const data = useSiteData<VanguardData>();
  function read(path: string): unknown {
    let value: unknown = data.content;
    for (const key of path.split(".")) {
      value = value && typeof value === "object" ? (value as Record<string, unknown>)[key] : undefined;
    }
    return value;
  }
  function t(path: string) {
    const value = read(path);
    return value === null || value === undefined ? "" : String(value);
  }
  function legacyMissing(path: string) {
    const value = read(path);
    return typeof value !== "string" || !value;
  }
  return { data, content: data.content, read, t, legacyMissing };
}
