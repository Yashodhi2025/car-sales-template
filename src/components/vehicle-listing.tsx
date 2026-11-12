"use client";
import { previewField } from "@/lib/preview-path";

import { EditableIcon, EditableLink, EditableText } from "./vanguard-editable";

import { withBasePath } from "@deneb-ui/ui";
import { useSiteContent, type VehicleId } from "@/lib/site-content";
import { Arrow } from "./vanguard-arrow";
import { carPageKey } from "@/lib/vehicles";
import { VanguardImage } from "./vanguard-image";

/** A keyed inventory card with persistent Deneb editing targets. */
export function VehicleListing({ id, index = 0 }: { id: VehicleId; index?: number }) {
  const { t, data } = useSiteContent();
  const canEnquire = data.requirements.requiredPages.includes("contact");
  const canView = data.requirements.requiredPages.includes(carPageKey(id));
  return (
    <article data-layout="grid" className={`vm-vehicle-card vm-card-premium ${/reserved/i.test(t(`cards.vehicles.${id}.availability`)) ? "is-reserved" : ""}`}>

        <div className="vm-vehicle-image-wrap">
          {canView ? <EditableLink href={withBasePath(t(`vehicles.${id}.detailLink`))} {...previewField(`vehicles.${id}.detailLink`)} targetPage={carPageKey(id)} className="vm-vehicle-photo-link">
            <VanguardImage id={`photos.vehicles.${id}.image0`} src={t(`photos.vehicles.${id}.image0`)} alt={t(`photos.vehicles.${id}.imageAlt`)} width={800} height={540} className="vm-vehicle-image" />
            <span className="vm-vehicle-explore"><EditableText id="vehicleDetails.viewDetailsLabel">{t("vehicleDetails.viewDetailsLabel")}</EditableText><Arrow /></span>
          </EditableLink> : <VanguardImage id={`photos.vehicles.${id}.image0`} src={t(`photos.vehicles.${id}.image0`)} alt={t(`photos.vehicles.${id}.imageAlt`)} width={800} height={540} className="vm-vehicle-image" />}
          <span className="vm-vehicle-index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
        </div>

      <EditableText cssTypography id={`cards.vehicles.${id}.badge`}>{t(`cards.vehicles.${id}.badge`)}</EditableText>
      <div>
        <EditableText cssTypography id={`cards.vehicles.${id}.meta`} as="p">{t(`cards.vehicles.${id}.meta`)}</EditableText>
        {canView ? <EditableLink href={withBasePath(t(`vehicles.${id}.detailLink`))} {...previewField(`vehicles.${id}.detailLink`)}><EditableText cssTypography id={`cards.vehicles.${id}.name`}>{t(`cards.vehicles.${id}.name`)}</EditableText></EditableLink> : <EditableText cssTypography id={`cards.vehicles.${id}.name`}>{t(`cards.vehicles.${id}.name`)}</EditableText>}
        <EditableText cssTypography id={`cards.vehicles.${id}.details`} as="p">{t(`cards.vehicles.${id}.details`)}</EditableText>
        <ul>{["mileage", "fuel", "transmission"].map(field => <li key={field}><EditableIcon fieldPath={`cards.vehicles.${id}.specs.${field}.icon`} name={t(`cards.vehicles.${id}.specs.${field}.icon`)} size={14} style={{marginRight:"0.25rem"}} /><EditableText cssTypography id={`cards.vehicles.${id}.${field}`}>{t(`cards.vehicles.${id}.${field}`)}</EditableText></li>)}</ul>
        <EditableText cssTypography id={`cards.vehicles.${id}.price`} as="p">{t(`cards.vehicles.${id}.price`)}</EditableText>
      </div>
      <div className="vm-vehicle-card-actions"><EditableText id="home.collection.priceCaption" as="p" className="vm-card-price-caption">{t("home.collection.priceCaption")}</EditableText><div className="vm-card-action-row">{canView && <EditableLink href={withBasePath(t(`vehicles.${id}.detailLink`))} {...previewField(`vehicles.${id}.detailLink`)} targetPage={carPageKey(id)} className="vm-card-detail-link"><EditableText id="vehicleDetails.viewDetailsLabel">{t("vehicleDetails.viewDetailsLabel")}</EditableText><Arrow /></EditableLink>}{canEnquire && (
        <EditableLink href={withBasePath(t(`cards.vehicles.${id}.enquiryLink`))}
          {...previewField(`cards.vehicles.${id}.enquiryLink`)} targetPage="contact" className="vm-vehicle-action">
          <span suppressHydrationWarning data-preview-field-path="home.collection.enquireLabel" aria-label={t("home.collection.enquireLabel")}><EditableText id="home.collection.cardEnquireLabel">{t("home.collection.cardEnquireLabel")}</EditableText></span>
        </EditableLink>
      )}</div></div>
      <div className="vm-availability">
        <span className="vm-status-dot" aria-hidden="true" />
        <EditableText id={`cards.vehicles.${id}.availability`}>{t(`cards.vehicles.${id}.availability`)}</EditableText>
      </div>
    </article>
  );
}
