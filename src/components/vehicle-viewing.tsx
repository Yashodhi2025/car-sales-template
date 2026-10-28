"use client";

import { EditableText } from "@deneb-ui/ui";
import { VanguardImage } from "./vanguard-image";
import { useSiteContent, type VehicleId } from "@/lib/site-content";
import { InquiryForm } from "./inquiry-form";

export function VehicleViewing({ vehicleId }: { vehicleId: VehicleId }) {
  const { t } = useSiteContent();
  const cp = `cards.vehicles.${vehicleId}`;
  return <section id="request-viewing" className="vm-viewing-section" aria-labelledby="viewing-title">
    <div className="vm-container vm-viewing-layout">
      <div className="vm-viewing-copy" data-reveal>
        <EditableText id="viewing.eyebrow" as="p" className="vm-eyebrow">{t("viewing.eyebrow")}</EditableText><h2 id="viewing-title" className="vm-title"><EditableText id="viewing.title">{t("viewing.title")}</EditableText></h2><EditableText id="viewing.description" as="p" className="vm-copy">{t("viewing.description")}</EditableText>
        <div className="vm-viewing-vehicle"><VanguardImage id={`photos.vehicles.${vehicleId}.image0`} src={t(`photos.vehicles.${vehicleId}.image0`)} alt={t(`photos.vehicles.${vehicleId}.imageAlt`)} width={600} height={400} loading="lazy" /><div><EditableText id="viewing.vehicleLabel" as="p" className="vm-eyebrow">{t("viewing.vehicleLabel")}</EditableText><EditableText id={`${cp}.name`} as="h3">{t(`${cp}.name`)}</EditableText><EditableText id={`${cp}.meta`} as="p">{t(`${cp}.meta`)}</EditableText><EditableText id={`${cp}.details`} as="p">{t(`${cp}.details`)}</EditableText></div></div>
        <EditableText id="viewing.dateNote" as="p" className="vm-car-small-print">{t("viewing.dateNote")}</EditableText><EditableText id="requests.demoNote" as="p" className="vm-car-small-print">{t("requests.demoNote")}</EditableText>
      </div>
      <InquiryForm mode="viewing" vehicleId={vehicleId} />
    </div>
  </section>;
}
