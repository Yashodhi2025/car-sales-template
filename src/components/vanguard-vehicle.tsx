"use client";
import { previewField, previewList } from "@/lib/preview-path";

import { EditableIcon, EditableLink, EditableText, EditableFeedback, LabelledRegion } from "./vanguard-editable";

import { useEffect, useRef } from "react";
import { withBasePath, PREVIEW_FOCUS_MESSAGE, DENEB_PREVIEW_FOCUS_MESSAGE, LEGACY_PREVIEW_FOCUS_MESSAGE } from "@deneb-ui/ui";
import { useSiteContent, type VehicleId } from "@/lib/site-content";
import { carPageKey, relatedVehicles, vehicleYear } from "@/lib/vehicles";
import { usePageEffects } from "./use-page-effects";
import { VehicleRepeatedTarget } from "./vehicle-repeated-target";
import { VehicleGallery } from "./vehicle-gallery";
import { VehicleListing } from "./vehicle-listing";
import { VehicleViewing } from "./vehicle-viewing";
import { VehicleLoanCalculator } from "./vehicle-loan-calculator";
import { Arrow } from "./vanguard-arrow";
import styles from "./vanguard-vehicle.module.css";

export function VanguardVehicle({ vehicleId: id }: { vehicleId: VehicleId }) {
  const { data, content, t } = useSiteContent();
  const root = useRef<HTMLElement>(null);
  usePageEffects(root);
  useEffect(() => {
    // Open supporting notes when their editable target is selected in Fivora.
    const focus = (event: MessageEvent) => {
      if (!(event.source === window.parent || (event.source === window && event.origin === location.origin)) || ![PREVIEW_FOCUS_MESSAGE, DENEB_PREVIEW_FOCUS_MESSAGE, LEGACY_PREVIEW_FOCUS_MESSAGE].includes(event.data?.type)) return;
      const path = String(event.data.fieldPath || "");
      root.current?.querySelectorAll(`[${"data-preview-field-path"}="${CSS.escape(path)}"]`).forEach(target => {
        for (let parent = target.parentElement; parent && parent !== root.current; parent = parent.parentElement) {
          if (parent instanceof HTMLDetailsElement) parent.open = true;
        }
      });
    };
    window.addEventListener("message", focus);
    return () => window.removeEventListener("message", focus);
  }, []);
  const card = content.cards.vehicles[id];
  const catalog = content.catalog[id];
  const cp = (field: string) => `cards.vehicles.${id}.${field}`;
  const brandPath = catalog.brand && Object.hasOwn(content.cards.brands, catalog.brand)
    ? `cards.brands.${catalog.brand}.displayName` : undefined;
  const bodyPath = catalog.bodyType && Object.hasOwn(content.vehicleDetails.bodyStyles, catalog.bodyType)
    ? `vehicleDetails.bodyStyles.${catalog.bodyType}` : "vehicleDetails.notSupplied";
  const related = relatedVehicles(content, id).filter(other => data.requirements.requiredPages.includes(carPageKey(other)));
  const specs = [
    { key: "year", path: cp("meta"), value: vehicleYear(card.meta) },
    ...["mileage", "fuel", "transmission"].map(key => ({ key, path: cp(key), value: t(cp(key)) })),
    ...["engine", "drivetrain", "power"].map(key => ({ key, path: `vehicles.${id}.${key}`, value: t(`vehicles.${id}.${key}`) })),
    { key: "body", path: bodyPath, value: t(bodyPath) },
  ];
  if (!data.requirements.requiredPages.includes(carPageKey(id))) return null;
  return (
    <main id="main-content" ref={root} className={`vm-page vm-car-page vm-car-editorial-page ${styles.page} ${/reserved/i.test(String(card.availability)) ? "is-reserved" : ""}`} data-preview-page-key={carPageKey(id)}>
      <section className="vm-car-showcase" aria-labelledby="vehicle-title"><div className="vm-container">
      <header className="vm-car-intro">
        <div className="vm-car-intro-top">
        <EditableLink href={withBasePath(t("common.navLinks.collection"))} data-preview-field-path="common.navLinks.collection" targetPage="inventory" className="vm-car-back"><Arrow back /><EditableText id="vehicleDetails.backLabel">{t("vehicleDetails.backLabel")}</EditableText></EditableLink>
        <div className="vm-car-eyebrow">{brandPath && <EditableText id={brandPath}>{t(brandPath)}</EditableText>}<span aria-hidden="true" /><EditableText id="vehicleDetails.collectionLabel">{t("vehicleDetails.collectionLabel")}</EditableText></div>
        </div>
        <div className="vm-car-title-row">
          <div className="vm-car-heading">
            <h1 id="vehicle-title" className="vm-car-title vm-hero-enter"><EditableLink href={withBasePath(t(`vehicles.${id}.detailLink`))} {...previewField(`vehicles.${id}.detailLink`)}><EditableText id={cp("name")}>{t(cp("name"))}</EditableText></EditableLink></h1>
          </div>
          <EditableText id={cp("meta")} as="p" className="vm-car-meta vm-hero-enter">{t(cp("meta"))}</EditableText>
        </div>
      </header>
      <div className="vm-car-showcase-grid">
        <VehicleGallery vehicleId={id} />
        <LabelledRegion as="aside" className="vm-car-inquiry" labelPath={"vehicleDetails.navigation.enquiry"}><div className="vm-car-inquiry-card">
          <EditableText id={cp("badge")} as="p" className="vm-eyebrow">{t(cp("badge"))}</EditableText>
          <EditableText id="vehicleDetails.priceLabel" as="p" className="vm-car-price-label">{t("vehicleDetails.priceLabel")}</EditableText>
          <EditableText id={cp("price")} as="p" className="vm-car-price">{t(cp("price"))}</EditableText>
          <EditableText id={cp("details")} as="p" className="vm-car-trim">{t(cp("details"))}</EditableText>
          <div className="vm-car-availability-row"><EditableText id="vehicleDetails.availabilityLabel">{t("vehicleDetails.availabilityLabel")}</EditableText><span className="vm-car-status"><span className="vm-status-dot" aria-hidden="true" /><EditableText id={cp("availability")}>{t(cp("availability"))}</EditableText></span></div>
          <EditableFeedback id="vehicleDetails.reservedNotice" as="p" className="vm-car-reserved" show={/reserved/i.test(String(card.availability))}>{t("vehicleDetails.reservedNotice")}</EditableFeedback>
          <div className="vm-car-key-facts">{(["mileage", "fuel", "transmission"] as const).map(field => <div key={field}><EditableIcon fieldPath={cp(`specs.${field}.icon`)} name={t(cp(`specs.${field}.icon`))} size={18} /><div><EditableText id={`vehicleDetails.labels.${field}`} as="p">{t(`vehicleDetails.labels.${field}`)}</EditableText><EditableText id={cp(field)}>{t(cp(field))}</EditableText></div></div>)}</div>
          <div className="vm-car-primary-actions">
          <EditableLink className="vm-button vm-button-primary vm-car-viewing" href={t(`vehicles.${id}.viewingLink`)} {...previewField(`vehicles.${id}.viewingLink`)}><EditableText id="vehicleDetails.viewingLabel">{t("vehicleDetails.viewingLabel")}</EditableText><Arrow /></EditableLink>
          {data.requirements.requiredPages.includes("contact") && <EditableLink className="vm-button vm-button-outline vm-car-enquire" href={withBasePath(t(cp("enquiryLink")))} data-preview-field-path={cp("enquiryLink")} targetPage="contact"><EditableText id="home.collection.enquireLabel">{t("home.collection.enquireLabel")}</EditableText><Arrow /></EditableLink>}
          </div>
          <details className={styles.enquiryOptions}><summary><EditableText id="vehicleDetails.enquiryOptionsLabel">{t("vehicleDetails.enquiryOptionsLabel")}</EditableText></summary><EditableText id="vehicleDetails.inquiryHint" as="p" className="vm-car-small-print">{t("vehicleDetails.inquiryHint")}</EditableText><div className="vm-car-secondary-actions">
          <EditableLink href={withBasePath(t(`vehicles.${id}.testDriveLink`))} {...previewField(`vehicles.${id}.testDriveLink`)} targetPage="contact" className="vm-text-link vm-car-test-drive"><EditableText id="vehicleDetails.testDriveLabel">{t("vehicleDetails.testDriveLabel")}</EditableText><Arrow /></EditableLink>
          <EditableLink href={withBasePath(t("vehicleDetails.dealerLink"))} data-preview-field-path="vehicleDetails.dealerLink" targetPage="contact" className="vm-text-link vm-car-test-drive"><EditableText id="vehicleDetails.dealerLabel">{t("vehicleDetails.dealerLabel")}</EditableText><Arrow /></EditableLink>
          </div></details>
        </div></LabelledRegion>
      </div>
      </div></section>
      <div className="vm-car-information">
      <LabelledRegion as="div" className="vm-car-details-panels" role="region" labelPath={"vehicleDetails.navigation.label"}>
      <div className="vm-container vm-car-content">
        <div className="vm-car-editorial">
          <LabelledRegion as="section" id="vehicle-overview" className="vm-car-overview vm-car-editorial-row vm-car-details-panel" data-detail-section="overview" labelPath={"vehicleDetails.navigation.overview"} data-reveal>
            <div className="vm-car-section-heading">
            <EditableText id="vehicleDetails.overviewEyebrow" as="p" className="vm-eyebrow">{t("vehicleDetails.overviewEyebrow")}</EditableText>
            <EditableText id="vehicleDetails.overviewTitle" as="h2" className="vm-title">{t("vehicleDetails.overviewTitle")}</EditableText>
            </div><EditableText id={`vehicles.${id}.description`} as="p" className="vm-car-description">{t(`vehicles.${id}.description`)}</EditableText>
          </LabelledRegion>
          <LabelledRegion as="section" id="vehicle-specifications" className="vm-car-specifications vm-car-editorial-row vm-car-details-panel" data-detail-section="specifications" labelPath={"vehicleDetails.navigation.specifications"}>
            <div className="vm-car-section-heading" data-reveal>
            <EditableText id="vehicleDetails.specsEyebrow" as="p" className="vm-eyebrow">{t("vehicleDetails.specsEyebrow")}</EditableText>
            <EditableText id="vehicleDetails.specsTitle" as="h2" className="vm-title">{t("vehicleDetails.specsTitle")}</EditableText>
            </div><div>
            <LabelledRegion as="div" className={styles.specScroller} role="region" tabIndex={0} labelPath={"vehicleDetails.specsTitle"}>
              <dl className={`vm-car-spec-grid ${styles.specCards}`}>
                {specs.map(spec => <div key={spec.key} data-spec={spec.key} data-long-value={spec.value.length > 18 || undefined} data-reveal>
                  <dt>
                    <EditableText id={`vehicleDetails.labels.${spec.key}`}>{t(`vehicleDetails.labels.${spec.key}`)}</EditableText>
                    <span className={styles.specVisual}>
                      <EditableIcon fieldPath={`vehicleDetails.specIcons.${spec.key}`} name={t(`vehicleDetails.specIcons.${spec.key}`)} size={20} />
                    </span>
                  </dt>
                  <dd><EditableText id={spec.path} placeholder={t("vehicleDetails.notSupplied")}>{spec.value}</EditableText></dd>
                </div>)}
              </dl>
            </LabelledRegion>
            <div className={styles.finishHeading} data-reveal><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></svg><EditableText id="vehicleDetails.finishTitle" as="h3" className="vm-spec-subtitle">{t("vehicleDetails.finishTitle")}</EditableText></div>
            <dl className="vm-car-spec-grid vm-car-finish-grid">{(["interiorColor","exteriorColor"] as const).map(field=><div key={field} data-spec={field} data-reveal><dt><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">{field === "interiorColor" ? <><path d="M6 13V6a3 3 0 0 1 3-3h3a3 3 0 0 1 3 3v7m-9-3H4v7h16v-7h-3M6 17v4m12-4v4M7 13h10"/></> : <><path d="M12 3a9 9 0 1 0 0 18h1a2 2 0 0 0 1-3.7 1.5 1.5 0 0 1 1-2.7h2a4 4 0 0 0 4-4C21 6.4 17 3 12 3Z"/><path d="M7 10h.01M11 7h.01M16 8h.01M6 14h.01" strokeWidth="3"/></>}</svg><EditableText id={`vehicleDetails.labels.${field}`}>{t(`vehicleDetails.labels.${field}`)}</EditableText></dt><dd><EditableText id={`vehicles.${id}.${field}`} placeholder={t("vehicleDetails.notSupplied")}>{t(`vehicles.${id}.${field}`)}</EditableText></dd><span className={styles.finishPreview} aria-hidden="true">?</span></div>)}</dl>
            <details className={styles.dataNotes}><summary><EditableText id="vehicleDetails.listingNotesLabel">{t("vehicleDetails.listingNotesLabel")}</EditableText></summary><EditableText id="vehicleDetails.finishNote" as="p" className="vm-car-small-print">{t("vehicleDetails.finishNote")}</EditableText><EditableText id="vehicleDetails.specsNote" as="p" className="vm-car-small-print">{t("vehicleDetails.specsNote")}</EditableText></details>
            </div>
          </LabelledRegion>
          <LabelledRegion as="section" id="vehicle-features" className="vm-car-features vm-car-editorial-row vm-car-details-panel" data-detail-section="features" labelPath={"vehicleDetails.navigation.features"}>
            <div className="vm-car-section-heading" data-reveal>
            <EditableText id="vehicleDetails.featuresTitle" as="h2" className="vm-title">{t("vehicleDetails.featuresTitle")}</EditableText>
            </div><div>
            <ul {...previewList(`vehicles.${id}.features`)}>{content.vehicles[id].features.map((feature, index) => <VehicleRepeatedTarget key={index} vehicleId={id} index={index} kind="featureItem"><li data-reveal><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m5 12 4 4L19 6" /></svg><VehicleRepeatedTarget vehicleId={id} index={index} kind="featureName"><EditableText id={`vehicles.${id}.features[${index}].name`}>{feature.name}</EditableText></VehicleRepeatedTarget></li></VehicleRepeatedTarget>)}</ul>
            <EditableText id="vehicleDetails.featuresNote" as="p" className="vm-car-small-print">{t("vehicleDetails.featuresNote")}</EditableText>
            </div>
          </LabelledRegion>
        </div>
      </div>
      <LabelledRegion as="div" id="vehicle-viewing-panel" className="vm-car-details-panel" data-detail-section="viewing" role="region" labelPath={"vehicleDetails.navigation.viewing"}><VehicleViewing vehicleId={id} /></LabelledRegion>
      </LabelledRegion>
      </div>
      <VehicleLoanCalculator vehicleId={id} />
      <section className="vm-car-related"><div className="vm-container">
        <div className="vm-section-heading" data-reveal><div><EditableText id="vehicleDetails.relatedEyebrow" as="p" className="vm-eyebrow">{t("vehicleDetails.relatedEyebrow")}</EditableText><EditableText id="vehicleDetails.relatedTitle" as="h2" className="vm-title">{t("vehicleDetails.relatedTitle")}</EditableText></div><EditableLink href={withBasePath(t("vehicleDetails.relatedLink"))} data-preview-field-path="vehicleDetails.relatedLink" targetPage="inventory" className="vm-text-link"><EditableText id="vehicleDetails.relatedLabel">{t("vehicleDetails.relatedLabel")}</EditableText><Arrow /></EditableLink></div>
        <div className="vm-vehicle-grid vm-related-grid">{related.map((other, index) => <div key={other} className="vm-vehicle-wrap" data-reveal><VehicleListing id={other} index={index} /></div>)}</div>
      </div></section>
    </main>
  );
}
