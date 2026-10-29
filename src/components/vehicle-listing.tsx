"use client";

import { EditableIcon, EditableLink, EditableText, EditableVehicleCard, withBasePath } from "@deneb-ui/ui";
import { useSiteContent, type VehicleId } from "@/lib/site-content";
import { Arrow } from "./vanguard-arrow";
import { carPageKey } from "@/lib/vehicles";
import { VanguardImage } from "./vanguard-image";

/** Vanguard's presentation of the installed Deneb card, reused across its pages. */
export function VehicleListing({ id, index = 0 }: { id: VehicleId; index?: number }) {
  const { t, legacyMissing, data } = useSiteContent();
  const canEnquire = data.requirements.requiredPages.includes("contact");
  const canView = data.requirements.requiredPages.includes(carPageKey(id));
  return (
    <EditableVehicleCard vehicleId={id} className={`vm-vehicle-card vm-card-premium ${/reserved/i.test(t(`cards.vehicles.${id}.availability`)) ? "is-reserved" : ""}`} href={canView ? withBasePath(t(`vehicles.${id}.detailLink`)) : undefined}
      imageSlot={
        <div className="vm-vehicle-image-wrap">
          {canView ? <EditableLink href={withBasePath(t(`vehicles.${id}.detailLink`))} data-preview-field-path={`vehicles.${id}.detailLink`} targetPage={carPageKey(id)} className="vm-vehicle-photo-link">
            <VanguardImage id={`photos.vehicles.${id}.image0`} src={t(`photos.vehicles.${id}.image0`)} alt={t(`photos.vehicles.${id}.imageAlt`)} width={800} height={540} className="vm-vehicle-image" />
            <span className="vm-vehicle-explore"><EditableText id="vehicleDetails.viewDetailsLabel">{t("vehicleDetails.viewDetailsLabel")}</EditableText><Arrow /></span>
          </EditableLink> : <VanguardImage id={`photos.vehicles.${id}.image0`} src={t(`photos.vehicles.${id}.image0`)} alt={t(`photos.vehicles.${id}.imageAlt`)} width={800} height={540} className="vm-vehicle-image" />}
          <span className="vm-vehicle-index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
        </div>
      }
      actionsSlot={<div className="vm-vehicle-card-actions"><EditableText id="home.collection.priceCaption" as="p" className="vm-card-price-caption">{t("home.collection.priceCaption")}</EditableText><div className="vm-card-action-row">{canView && <EditableLink href={withBasePath(t(`vehicles.${id}.detailLink`))} data-preview-field-path={`vehicles.${id}.detailLink`} targetPage={carPageKey(id)} className="vm-card-detail-link"><EditableText id="vehicleDetails.viewDetailsLabel">{t("vehicleDetails.viewDetailsLabel")}</EditableText><Arrow /></EditableLink>}{canEnquire && (
        <EditableLink href={withBasePath(t(`cards.vehicles.${id}.enquiryLink`))}
          data-preview-field-path={`cards.vehicles.${id}.enquiryLink`} targetPage="contact" className="vm-vehicle-action">
          <EditableText id="home.collection.cardEnquireLabel">{t("home.collection.cardEnquireLabel")}</EditableText>
        </EditableLink>
      )}</div></div>}>
      <div className="vm-availability">
        <span className="vm-status-dot" aria-hidden="true" />
        <EditableText id={`cards.vehicles.${id}.availability`}>{t(`cards.vehicles.${id}.availability`)}</EditableText>
      </div>
      {/* 2.0.130 omits these fields when empty/non-string. Keep one real target
          per source field, including its editable specification icon. */}
      {["meta", "details", "badge", "mileage", "fuel", "transmission", "price"].map(field =>
        legacyMissing(`cards.vehicles.${id}.${field}`) ? (
          <span key={field} className="vm-card-empty-field">
            <EditableText id={`cards.vehicles.${id}.${field}`} className="vm-empty-target">{t(`cards.vehicles.${id}.${field}`)}</EditableText>
            {["mileage", "fuel", "transmission"].includes(field) && (
              <EditableIcon fieldPath={`cards.vehicles.${id}.specs.${field}.icon`}
                name={t(`cards.vehicles.${id}.specs.${field}.icon`)} size={14} />
            )}
          </span>
        ) : null,
      )}
    </EditableVehicleCard>
  );
}
