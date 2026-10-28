"use client";

import { useRef } from "react";
import { EditableIcon, EditableLink, EditableText, withBasePath } from "@deneb-ui/ui";
import { useSiteContent, type VehicleId } from "@/lib/site-content";
import { carPageKey, relatedVehicles, vehicleYear } from "@/lib/vehicles";
import { usePageEffects } from "./use-page-effects";
import { VehicleGallery } from "./vehicle-gallery";
import { VehicleListing } from "./vehicle-listing";
import { VehicleViewing } from "./vehicle-viewing";
import { Arrow } from "./vanguard-arrow";

export function VanguardVehicle({ vehicleId: id }: { vehicleId: VehicleId }) {
  const { data, content, t } = useSiteContent();
  const root = useRef<HTMLElement>(null);
  usePageEffects(root);
  const card = content.cards.vehicles[id];
  const catalog = content.catalog[id];
  const cp = (field: string) => `cards.vehicles.${id}.${field}`;
  const brandPath = `cards.brands.${catalog.brand}.displayName`;
  const related = relatedVehicles(content, id).filter(other => data.requirements.requiredPages.includes(carPageKey(other)));
  const specs = [
    { key: "year", path: cp("meta"), value: vehicleYear(card.meta) },
    ...["mileage", "fuel", "transmission"].map(key => ({ key, path: cp(key), value: t(cp(key)) })),
    ...["engine", "drivetrain", "power"].map(key => ({ key, path: `vehicles.${id}.${key}`, value: t(`vehicles.${id}.${key}`) })),
    { key: "body", path: `vehicleDetails.bodyStyles.${catalog.bodyType}`, value: t(`vehicleDetails.bodyStyles.${catalog.bodyType}`) },
  ];
  if (!data.requirements.requiredPages.includes(carPageKey(id))) return null;
  return (
    <main id="main-content" ref={root} className={`vm-page vm-car-page vm-car-editorial-page ${/reserved/i.test(String(card.availability)) ? "is-reserved" : ""}`} data-preview-page-key={carPageKey(id)}>
      <section className="vm-car-showcase" aria-labelledby="vehicle-title"><div className="vm-container">
      <header className="vm-car-intro">
        <div className="vm-car-intro-top">
        <EditableLink href={withBasePath("/inventory")} targetPage="inventory" className="vm-car-back"><Arrow back /><EditableText id="vehicleDetails.backLabel">{t("vehicleDetails.backLabel")}</EditableText></EditableLink>
        <div className="vm-car-eyebrow"><EditableText id={brandPath}>{t(brandPath)}</EditableText><span aria-hidden="true" /><EditableText id="vehicleDetails.collectionLabel">{t("vehicleDetails.collectionLabel")}</EditableText></div>
        </div>
        <div className="vm-car-title-row">
          <div className="vm-car-heading">
            <h1 id="vehicle-title" className="vm-car-title vm-hero-enter"><EditableText id={cp("name")}>{t(cp("name"))}</EditableText></h1>
          </div>
          <EditableText id={cp("meta")} as="p" className="vm-car-meta vm-hero-enter">{t(cp("meta"))}</EditableText>
        </div>
      </header>
      <div className="vm-car-showcase-grid">
        <VehicleGallery vehicleId={id} />
        <aside className="vm-car-inquiry" aria-label={t("vehicleDetails.navigation.enquiry")}><div className="vm-car-inquiry-card">
          <EditableText id={cp("badge")} as="p" className="vm-eyebrow">{t(cp("badge"))}</EditableText>
          <EditableText id="vehicleDetails.priceLabel" as="p" className="vm-car-price-label">{t("vehicleDetails.priceLabel")}</EditableText>
          <EditableText id={cp("price")} as="p" className="vm-car-price">{t(cp("price"))}</EditableText>
          <EditableText id={cp("details")} as="p" className="vm-car-trim">{t(cp("details"))}</EditableText>
          <div className="vm-car-availability-row"><EditableText id="vehicleDetails.availabilityLabel">{t("vehicleDetails.availabilityLabel")}</EditableText><span className="vm-car-status"><span className="vm-status-dot" aria-hidden="true" /><EditableText id={cp("availability")}>{t(cp("availability"))}</EditableText></span></div>
          <EditableText id="vehicleDetails.reservedNotice" as="p" className="vm-car-reserved" hidden={!/reserved/i.test(String(card.availability))}>{t("vehicleDetails.reservedNotice")}</EditableText>
          <div className="vm-car-key-facts">{(["mileage", "fuel", "transmission"] as const).map(field => <div key={field}><EditableIcon fieldPath={cp(`specs.${field}.icon`)} name={t(cp(`specs.${field}.icon`))} size={18} /><div><EditableText id={`vehicleDetails.labels.${field}`} as="p">{t(`vehicleDetails.labels.${field}`)}</EditableText><EditableText id={cp(field)}>{t(cp(field))}</EditableText></div></div>)}</div>
          <EditableText id="vehicleDetails.inquiryHint" as="p" className="vm-car-small-print">{t("vehicleDetails.inquiryHint")}</EditableText>
          <div className="vm-car-primary-actions">
          {data.requirements.requiredPages.includes("contact") && <EditableLink className="vm-button vm-button-primary vm-car-enquire" href={withBasePath(t(cp("enquiryLink")))} data-preview-field-path={cp("enquiryLink")} targetPage="contact"><EditableText id="home.collection.enquireLabel">{t("home.collection.enquireLabel")}</EditableText><Arrow /></EditableLink>}
          <EditableLink className="vm-button vm-button-outline vm-car-viewing" href={t(`vehicles.${id}.viewingLink`)} data-preview-field-path={`vehicles.${id}.viewingLink`}><EditableText id="vehicleDetails.viewingLabel">{t("vehicleDetails.viewingLabel")}</EditableText><Arrow /></EditableLink>
          </div>
          <div className="vm-car-secondary-actions">
          <EditableLink href={withBasePath(t(`vehicles.${id}.testDriveLink`))} data-preview-field-path={`vehicles.${id}.testDriveLink`} targetPage="contact" className="vm-text-link vm-car-test-drive"><EditableText id="vehicleDetails.testDriveLabel">{t("vehicleDetails.testDriveLabel")}</EditableText><Arrow /></EditableLink>
          <EditableLink href={withBasePath(t("vehicleDetails.dealerLink"))} data-preview-field-path="vehicleDetails.dealerLink" targetPage="contact" className="vm-text-link vm-car-test-drive"><EditableText id="vehicleDetails.dealerLabel">{t("vehicleDetails.dealerLabel")}</EditableText><Arrow /></EditableLink>
          </div>
        </div></aside>
      </div>
      </div></section>
      <nav className="vm-car-section-nav" aria-label={t("vehicleDetails.navigation.label")}><div className="vm-container">
        {([['overview', 'vehicle-overview'], ['specifications', 'vehicle-specifications'], ['features', 'vehicle-features'], ['viewing', 'request-viewing']] as const).map(([key, target]) => <a key={key} href={`#${target}`}><EditableText id={`vehicleDetails.navigation.${key}`}>{t(`vehicleDetails.navigation.${key}`)}</EditableText><Arrow /></a>)}
      </div></nav>
      <div className="vm-container vm-car-content">
        <div className="vm-car-editorial">
          <section id="vehicle-overview" className="vm-car-overview vm-car-editorial-row" data-reveal>
            <div className="vm-car-section-heading"><span className="vm-car-section-number" aria-hidden="true">01</span>
            <EditableText id="vehicleDetails.overviewEyebrow" as="p" className="vm-eyebrow">{t("vehicleDetails.overviewEyebrow")}</EditableText>
            <EditableText id="vehicleDetails.overviewTitle" as="h2" className="vm-title">{t("vehicleDetails.overviewTitle")}</EditableText>
            </div><EditableText id={`vehicles.${id}.description`} as="p" className="vm-car-description">{t(`vehicles.${id}.description`)}</EditableText>
          </section>
          <section id="vehicle-specifications" className="vm-car-specifications vm-car-editorial-row" data-reveal>
            <div className="vm-car-section-heading"><span className="vm-car-section-number" aria-hidden="true">02</span>
            <EditableText id="vehicleDetails.specsEyebrow" as="p" className="vm-eyebrow">{t("vehicleDetails.specsEyebrow")}</EditableText>
            <EditableText id="vehicleDetails.specsTitle" as="h2" className="vm-title">{t("vehicleDetails.specsTitle")}</EditableText>
            </div><div>
            <dl className="vm-car-spec-grid">{specs.map(spec => <div key={spec.key} data-spec={spec.key}><dt><EditableIcon fieldPath={`vehicleDetails.specIcons.${spec.key}`} name={t(`vehicleDetails.specIcons.${spec.key}`)} size={16} /><EditableText id={`vehicleDetails.labels.${spec.key}`}>{t(`vehicleDetails.labels.${spec.key}`)}</EditableText></dt><dd><EditableText id={spec.path} placeholder={t("vehicleDetails.notSupplied")}>{spec.value}</EditableText></dd></div>)}</dl>
            <EditableText id="vehicleDetails.finishTitle" as="h3" className="vm-spec-subtitle">{t("vehicleDetails.finishTitle")}</EditableText>
            <dl className="vm-car-spec-grid vm-car-finish-grid">{(["interiorColor","exteriorColor"] as const).map(field=><div key={field} data-spec={field}><dt><EditableText id={`vehicleDetails.labels.${field}`}>{t(`vehicleDetails.labels.${field}`)}</EditableText></dt><dd><EditableText id={`vehicles.${id}.${field}`} placeholder={t("vehicleDetails.notSupplied")}>{t(`vehicles.${id}.${field}`)}</EditableText></dd></div>)}</dl>
            <EditableText id="vehicleDetails.finishNote" as="p" className="vm-car-small-print">{t("vehicleDetails.finishNote")}</EditableText>
            <EditableText id="vehicleDetails.specsNote" as="p" className="vm-car-small-print">{t("vehicleDetails.specsNote")}</EditableText>
            </div>
          </section>
          <section id="vehicle-features" className="vm-car-features vm-car-editorial-row" data-reveal>
            <div className="vm-car-section-heading"><span className="vm-car-section-number" aria-hidden="true">03</span>
            <EditableText id="vehicleDetails.featuresTitle" as="h2" className="vm-title">{t("vehicleDetails.featuresTitle")}</EditableText>
            </div><div>
            <ul>{content.vehicles[id].features.map((feature, index) => <li key={index} data-preview-item-path={`vehicles.${id}.features.${index}`}><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m5 12 4 4L19 6" /></svg><EditableText id={`vehicles.${id}.features.${index}.name`}>{feature.name}</EditableText></li>)}</ul>
            <EditableText id="vehicleDetails.featuresNote" as="p" className="vm-car-small-print">{t("vehicleDetails.featuresNote")}</EditableText>
            </div>
          </section>
        </div>
      </div>
      <VehicleViewing vehicleId={id} />
      <section className="vm-car-related"><div className="vm-container">
        <div className="vm-section-heading" data-reveal><div><EditableText id="vehicleDetails.relatedEyebrow" as="p" className="vm-eyebrow">{t("vehicleDetails.relatedEyebrow")}</EditableText><EditableText id="vehicleDetails.relatedTitle" as="h2" className="vm-title">{t("vehicleDetails.relatedTitle")}</EditableText></div><EditableLink href={withBasePath(t("vehicleDetails.relatedLink"))} data-preview-field-path="vehicleDetails.relatedLink" targetPage="inventory" className="vm-text-link"><EditableText id="vehicleDetails.relatedLabel">{t("vehicleDetails.relatedLabel")}</EditableText><Arrow /></EditableLink></div>
        <div className="vm-vehicle-grid vm-related-grid">{related.map((other, index) => <div key={other} className="vm-vehicle-wrap" data-reveal><VehicleListing id={other} index={index} /></div>)}</div>
      </div></section>
    </main>
  );
}
