"use client";

import type { RefObject } from "react";
import { useSectionNavigation } from "./use-section-navigation";

export const vehicleSections = [
  { key: "overview", target: "vehicle-overview" },
  { key: "specifications", target: "vehicle-specifications" },
  { key: "features", target: "vehicle-features" },
  { key: "viewing", target: "request-viewing", aliases: ["vehicle-viewing-panel"] },
] as const;

export function useVehicleSections(root: RefObject<HTMLElement | null>, motionEnabled: boolean) {
  const navigation = useSectionNavigation(root, motionEnabled, vehicleSections);
  return { ...navigation, active: navigation.active ?? vehicleSections[0].key };
}
