"use client";

import { useEffect } from "react";
import { DENEB_PREVIEW_FOCUS_MESSAGE, LEGACY_PREVIEW_FOCUS_MESSAGE, PREVIEW_FOCUS_MESSAGE } from "@deneb-ui/ui";

/** Make an inactive source-backed photo visible before Lab selects its target. */
export function useVehiclePhotoFocus(vehicleId: string, count: number, select: (index: number) => void) {
  useEffect(() => {
    const focus = (event: MessageEvent) => {
      if (!(event.source === window.parent || (event.source === window && event.origin === location.origin)) || ![PREVIEW_FOCUS_MESSAGE,DENEB_PREVIEW_FOCUS_MESSAGE,LEGACY_PREVIEW_FOCUS_MESSAGE].includes(event.data?.type)) return;
      const path = String(event.data.fieldPath || "").replace(/\[(\d+)\]/g,".$1");
      const prefix = `photos.vehicles.${vehicleId}.`;
      if (!path.startsWith(prefix)) return;
      const suffix = path.slice(prefix.length);
      const match = suffix.match(/^gallery\.(\d+)\.(image|caption|imageAlt)$/);
      const index = match ? Number(match[1]) + 1 : /^(image0|imageAlt|caption)$/.test(suffix) ? 0 : -1;
      if (index >= 0 && index < count) select(index);
    };
    window.addEventListener("message",focus);
    return () => window.removeEventListener("message",focus);
  }, [vehicleId,count,select]);
}
