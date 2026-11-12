"use client";

import { useSiteData, type TemplateTheme } from "@deneb-ui/ui";
import type initialSiteData from "@/data/site-data.json";

type InitialData = typeof initialSiteData;
type InitialContent = InitialData["content"];
type NumberedCopy = { number: string; title: string; text: string };
type NamedItem = { name: string };
type GalleryItem = { image: string; imageAlt: string; caption: string };
type Review = { quote: string; name: string; detail: string; initials: string; image: string; imageAlt: string };
type Service = {
  name: string; description: string; icon: string; buttonLabel: string;
  buttonLink: string; targetPage: string; imageUrl: string; kicker: string;
  includes: NamedItem[];
};

// The validator replaces editable lists with [] and may omit styles entirely.
// Declare their item shapes independently of the current JSON fixture.
type VanguardContent = Omit<InitialContent, "home" | "about" | "photos" | "vehicles" | "requests" | "services" | "faq"> & {
  home: Omit<InitialContent["home"], "benefits" | "reviews"> & { benefits: { icon: string; title: string; text: string }[]; reviews: Review[] };
  about: Omit<InitialContent["about"], "journey"> & { journey: NumberedCopy[] };
  photos: Omit<InitialContent["photos"], "vehicles"> & {
    vehicles: { [Id in keyof InitialContent["photos"]["vehicles"]]: Omit<InitialContent["photos"]["vehicles"][Id], "gallery"> & { gallery: GalleryItem[] } };
  };
  vehicles: { [Id in keyof InitialContent["vehicles"]]: Omit<InitialContent["vehicles"][Id], "features"> & { features: NamedItem[] } };
  requests: Omit<InitialContent["requests"], "types"> & { types: { key: string; label: string }[] };
  services: Omit<InitialContent["services"], "items" | "trustFeatures" | "steps"> & {
    items: Service[];
    trustFeatures: { icon: string; title: string; text: string }[];
    steps: { number: string; title: string; text: string }[];
  };
  faq: Omit<InitialContent["faq"], "items"> & { items: { question: string; answer: string }[] };
};

export type VanguardData = Omit<InitialData, "content" | "styles" | "template"> & {
  content: VanguardContent;
  styles?: Record<string, Record<string, unknown>> | null;
  template: Omit<InitialData["template"], "structure"> & {
    structure?: { pages?: string[]; theme?: TemplateTheme | null } | null;
  };
};
export type VehicleId = keyof VanguardData["content"]["cards"]["vehicles"];

export function useSiteContent() {
  const data = useSiteData<VanguardData>();
  function read(path: string): unknown {
    let value: unknown = data.content;
    for (const key of path.replace(/\[(\d+)\]/g, ".$1").split(".")) {
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
