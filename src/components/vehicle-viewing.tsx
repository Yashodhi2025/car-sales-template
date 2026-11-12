"use client";

import { EditableText } from "@deneb-ui/ui";
import { useSiteContent, type VehicleId } from "@/lib/site-content";
import { InquiryForm } from "./inquiry-form";
import { VanguardImage } from "./vanguard-image";
import styles from "./vehicle-viewing.module.css";

export function VehicleViewing({ vehicleId }: { vehicleId: VehicleId }) {
  const { t } = useSiteContent();
  const cp = `cards.vehicles.${vehicleId}`;
  return <section id="request-viewing" className={`vm-viewing-section ${styles.section}`} aria-labelledby="viewing-title">
    <div className="vm-container vm-viewing-layout">
      <div className="vm-viewing-copy" data-reveal>
        <div className="vm-viewing-photo"><VanguardImage id={`photos.vehicles.${vehicleId}.image0`} src={t(`photos.vehicles.${vehicleId}.image0`)} alt={t(`${cp}.name`)} width={900} height={550} /></div>
        <div className="vm-viewing-vehicle"><div><EditableText id="viewing.vehicleLabel" as="p" className="vm-eyebrow">{t("viewing.vehicleLabel")}</EditableText><EditableText id={`${cp}.name`} as="h3">{t(`${cp}.name`)}</EditableText><EditableText id={`${cp}.meta`} as="p">{t(`${cp}.meta`)}</EditableText><EditableText id={`${cp}.details`} as="p">{t(`${cp}.details`)}</EditableText></div></div>
      </div>
      <div className="vm-viewing-form-wrap" data-reveal>
        <header className={styles.heading}>
          <span className={styles.icon} aria-hidden="true"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v4m10-4v4M3 11h18m-14 5h3m4 0h3"/></svg></span>
          <div><EditableText id="viewing.eyebrow" as="p" className={styles.eyebrow}>{t("viewing.eyebrow")}</EditableText><h2 id="viewing-title"><EditableText id="viewing.title" className={styles.title}>{t("viewing.title")}</EditableText></h2><EditableText id="viewing.description" as="p" className={styles.description}>{t("viewing.description")}</EditableText></div>
        </header>
        <InquiryForm mode="viewing" vehicleId={vehicleId} />
        <details className="vm-viewing-notes"><summary><EditableText id="viewing.notesLabel">{t("viewing.notesLabel")}</EditableText></summary><div className="vm-car-inquiry-notes"><EditableText id="viewing.dateNote" as="p" className="vm-car-small-print">{t("viewing.dateNote")}</EditableText><EditableText id="vehicleDetails.viewingNote" as="p" className="vm-car-small-print">{t("vehicleDetails.viewingNote")}</EditableText><EditableText id="vehicleDetails.testDriveNote" as="p" className="vm-car-small-print">{t("vehicleDetails.testDriveNote")}</EditableText><EditableText id="requests.demoNote" as="p" className="vm-car-small-print">{t("requests.demoNote")}</EditableText></div></details>
      </div>
    </div>
  </section>;
}
