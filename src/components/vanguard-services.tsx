"use client";

import { useRef } from "react";
import { EditableIcon, EditableLink, EditableServiceCard, EditableText, withBasePath } from "@deneb-ui/ui";
import { useSiteContent } from "@/lib/site-content";
import { Arrow } from "./vanguard-arrow";
import { usePageEffects } from "./use-page-effects";
import { VanguardImage } from "./vanguard-image";

export function VanguardServices() {
  const { data, content, t } = useSiteContent();
  const root=useRef<HTMLElement>(null);
  usePageEffects(root);
  if(!data.requirements.requiredPages.includes("services")) return null;
  function servicePanel(service: typeof content.services.items[number], index: number) {
    const path=`services.items.${index}`;
    // Compose the existing card's editable copy with a lazy, failure-safe media slot.
    const { imageUrl, ...copy } = service;
    return <article key={index} id={`service-${index}`} data-reveal className={`vm-service-card vm-editorial-service vm-editorial-service-${index}`}>
      <div className="service-card-image-wrap"><VanguardImage id={`${path}.imageUrl`} src={imageUrl} alt={service.name} width={1400} height={950} className="service-card-image" /></div>
      <EditableServiceCard as="div" itemPath={path} service={{...copy,name:t(`${path}.name`),description:t(`${path}.description`)}} showPrice={false} showStatusBadge={false} className="vm-service-copy">
        <div className="vm-service-strap"><EditableIcon fieldPath={`${path}.icon`} name={service.icon} size={18} className="vm-editorial-icon" /><EditableText id={`${path}.kicker`}>{t(`${path}.kicker`)}</EditableText><span className="vm-editorial-index" aria-hidden="true">{String(index+1).padStart(2,"0")}</span></div>
        <ul className="vm-service-includes">{service.includes.map((item,itemIndex)=><li key={itemIndex} data-preview-item-path={`${path}.includes.${itemIndex}`}><EditableText id={`${path}.includes.${itemIndex}.name`}>{t(`${path}.includes.${itemIndex}.name`)}</EditableText></li>)}</ul>
        <EditableLink href={withBasePath(service.buttonLink)} data-preview-field-path={`${path}.buttonLink`} targetPage={service.targetPage} className="vm-text-link"><EditableText id={`${path}.buttonLabel`}>{service.buttonLabel}</EditableText><Arrow /></EditableLink>
      </EditableServiceCard>
    </article>;
  }
  return <main id="main-content" ref={root} className="vm-page vm-services-page" data-preview-page-key="services">
    <header className="vm-services-hero">
      <div className="vm-services-hero-photo"><VanguardImage id="services.heroImage" src={t("services.heroImage")} alt={t("services.heroImageAlt")} width={2400} height={1600} loading="eager" fetchPriority="high" /></div>
      <div className="vm-services-hero-shade" aria-hidden="true" />
      <div className="vm-container vm-services-hero-content"><div>
        <EditableText id="services.eyebrow" as="p" className="vm-eyebrow vm-hero-enter">{t("services.eyebrow")}</EditableText>
        <EditableText id="services.heroTitle" as="h1" className="vm-services-hero-title vm-hero-enter">{t("services.heroTitle")}</EditableText>
        <EditableText id="services.heroDescription" as="p" className="vm-services-hero-description vm-hero-enter">{t("services.heroDescription")}</EditableText>
        <div className="vm-actions vm-hero-enter"><EditableLink href={withBasePath(t("services.heroPrimaryLink"))} data-preview-field-path="services.heroPrimaryLink" className="vm-button vm-button-primary"><EditableText id="services.heroPrimaryLabel">{t("services.heroPrimaryLabel")}</EditableText><Arrow /></EditableLink><EditableLink href={withBasePath(t("services.heroSecondaryLink"))} data-preview-field-path="services.heroSecondaryLink" targetPage="inventory" className="vm-text-link"><EditableText id="services.heroSecondaryLabel">{t("services.heroSecondaryLabel")}</EditableText><Arrow /></EditableLink></div>
      </div><div className="vm-services-hero-bottom"><EditableText id="services.indexLabel">{t("services.indexLabel")}</EditableText><EditableText id="services.heroCaption">{t("services.heroCaption")}</EditableText></div></div>
    </header>
    <section id="offerings" className="vm-services-editorial"><div className="vm-services-light"><div className="vm-container">
    <div className="vm-service-intro" data-reveal><EditableText id="services.title" as="h2" className="vm-title">{t("services.title")}</EditableText><div><EditableText id="services.description" as="p" className="vm-copy">{t("services.description")}</EditableText><EditableText id="services.demoNote" as="p" className="vm-services-note">{t("services.demoNote")}</EditableText></div></div>
    <div className="vm-service-editorial-grid">{content.services.items.slice(0,3).map(servicePanel)}</div>
    </div></div><div className="vm-container vm-services-dark"><div className="vm-service-editorial-grid">{content.services.items.slice(3).map((service,index)=>servicePanel(service,index+3))}</div></div>
    </section>
    <section className="vm-services-closing"><div className="vm-container" data-reveal><div><EditableText id="services.closingEyebrow" as="p" className="vm-eyebrow">{t("services.closingEyebrow")}</EditableText><EditableText id="services.closingTitle" as="h2" className="vm-title">{t("services.closingTitle")}</EditableText><EditableText id="services.closingDescription" as="p" className="vm-copy">{t("services.closingDescription")}</EditableText></div><EditableLink href={withBasePath(t("services.closingButtonLink"))} data-preview-field-path="services.closingButtonLink" targetPage="contact" className="vm-button vm-button-primary"><EditableText id="services.closingButtonLabel">{t("services.closingButtonLabel")}</EditableText><Arrow /></EditableLink></div></section>
  </main>;
}
