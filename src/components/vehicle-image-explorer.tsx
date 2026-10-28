"use client";

import { useEffect, useRef } from "react";
import { EditableText, DENEB_PREVIEW_FOCUS_MESSAGE, LEGACY_PREVIEW_FOCUS_MESSAGE, PREVIEW_FOCUS_MESSAGE } from "@deneb-ui/ui";
import { useSiteContent, type VehicleId } from "@/lib/site-content";
import { vehiclePhotos } from "@/lib/vehicles";

/** The existing multi-angle controls now share the main gallery, without a
 * second large rendering of the same photographs or an invented 360 scan. */
export function VehicleImageExplorer({ vehicleId, active, onSelect }: { vehicleId: VehicleId; active: number; onSelect: (index: number) => void }) {
  const { content, t } = useSiteContent();
  const disclosure = useRef<HTMLDetailsElement>(null);
  const photos = vehiclePhotos(content, vehicleId);
  useEffect(() => {
    const focus = (event: MessageEvent) => {
      if (!(event.source === window.parent || (event.source === window && event.origin === location.origin)) || ![PREVIEW_FOCUS_MESSAGE, DENEB_PREVIEW_FOCUS_MESSAGE, LEGACY_PREVIEW_FOCUS_MESSAGE].includes(event.data?.type)) return;
      const path = String(event.data.fieldPath || "");
      if ((path.startsWith("vehicleDetails.explorer.") || path === "vehicleDetails.gallery.keyboardHint") && disclosure.current) disclosure.current.open = true;
    };
    window.addEventListener("message", focus);
    return () => window.removeEventListener("message", focus);
  }, []);
  return <details ref={disclosure} className="vm-gallery-explorer">
    <summary><EditableText id="vehicleDetails.explorer.title">{t("vehicleDetails.explorer.title")}</EditableText><span className="vm-explorer-disclosure-icon" aria-hidden="true" /></summary>
    <div className="vm-gallery-explorer-content">
      <EditableText id="vehicleDetails.explorer.eyebrow" as="p" className="vm-eyebrow">{t("vehicleDetails.explorer.eyebrow")}</EditableText>
      <EditableText id="vehicleDetails.explorer.description" as="p">{t("vehicleDetails.explorer.description")}</EditableText>
      <div className="vm-explorer-views">{photos.map((photo, index) => <button key={photo.imagePath} type="button" aria-pressed={index === active} onClick={() => onSelect(index)}><EditableText id="vehicleDetails.explorer.viewLabel">{t("vehicleDetails.explorer.viewLabel")}</EditableText> {String(index + 1).padStart(2, "0")}</button>)}</div>
      <EditableText id="vehicleDetails.explorer.hint" as="p">{t("vehicleDetails.explorer.hint")}</EditableText>
      <EditableText id="vehicleDetails.gallery.keyboardHint" as="p">{t("vehicleDetails.gallery.keyboardHint")}</EditableText>
      <EditableText id="vehicleDetails.explorer.notice" as="p" className="vm-gallery-explorer-notice">{t("vehicleDetails.explorer.notice")}</EditableText>
    </div>
  </details>;
}
