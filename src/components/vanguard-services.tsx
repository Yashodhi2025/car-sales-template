"use client";

import { useMemo, useRef, type CSSProperties } from "react";
import { EditableIcon, EditableLink, EditableServiceCard, EditableText, withBasePath } from "@deneb-ui/ui";
import { useSiteContent } from "@/lib/site-content";
import { Arrow } from "./vanguard-arrow";
import { usePageEffects } from "./use-page-effects";
import { VanguardImage } from "./vanguard-image";
import { useSectionNavigation } from "./use-section-navigation";

export function VanguardServices() {
  const { data, content, t } = useSiteContent();
  const root=useRef<HTMLElement>(null);
  usePageEffects(root);
  const count = content.services.items.length;
  const sections = useMemo(() => Array.from({ length: count }, (_, index) => ({ key: `service-${index}`, target: `service-${index}` })), [count]);
  const navigation = useSectionNavigation(root, Boolean(content.motion.enabled), sections);
  const activeIndex = Math.max(0, sections.findIndex(section => section.key === navigation.active));
  if(!data.requirements.requiredPages.includes("services")) return null;
  function servicePanel(service: typeof content.services.items[number], index: number) {
    const path=`services.items.${index}`;
    // Compose the existing card's editable copy with a lazy, failure-safe media slot.
    const { imageUrl, ...copy } = service;
    return <article key={index} id={`service-${index}`} data-reveal className={`vm-service-card vm-editorial-service vm-service-feature vm-service-feature-${index} ${index === 3 ? "vm-dark-surface" : ""}`}>
      <div className="service-card-image-wrap"><VanguardImage id={`${path}.imageUrl`} src={imageUrl} alt={service.name} width={1400} height={950} className="service-card-image" /></div>
      <EditableServiceCard as="div" itemPath={path} service={{...copy,name:t(`${path}.name`),description:t(`${path}.description`)}} showPrice={false} showStatusBadge={false} className="vm-service-copy">
        <div className="vm-service-strap"><EditableIcon fieldPath={`${path}.icon`} name={service.icon} size={18} className="vm-editorial-icon" /><EditableText id={`${path}.kicker`}>{t(`${path}.kicker`)}</EditableText><span className="vm-editorial-index" aria-hidden="true">{String(index+1).padStart(2,"0")}</span></div>
        <ul className="vm-service-includes">{service.includes.map((item,itemIndex)=><li key={itemIndex} data-preview-item-path={`${path}.includes.${itemIndex}`}><EditableText id={`${path}.includes.${itemIndex}.name`}>{t(`${path}.includes.${itemIndex}.name`)}</EditableText></li>)}</ul>
        <EditableLink href={withBasePath(service.buttonLink)} data-preview-field-path={`${path}.buttonLink`} targetPage={service.targetPage} className="vm-button vm-button-outline vm-service-action"><EditableText id={`${path}.buttonLabel`}>{service.buttonLabel}</EditableText><Arrow /></EditableLink>
      </EditableServiceCard>
    </article>;
  }
  return <main id="main-content" ref={root} className="vm-page vm-services-page vm-editorial-page" data-preview-page-key="services">
    <header className="vm-services-hero vm-dark-surface">
      <div className="vm-container">
        <div className="vm-editorial-topline"><EditableText id="services.eyebrow" as="p" className="vm-eyebrow vm-hero-enter">{t("services.eyebrow")}</EditableText><EditableText id="services.indexLabel">{t("services.indexLabel")}</EditableText></div>
      <div className="vm-services-opening"><div className="vm-services-opening-copy">
        <EditableText id="services.heroTitle" as="h1" className="vm-services-hero-title vm-hero-enter">{t("services.heroTitle")}</EditableText>
        <EditableText id="services.heroDescription" as="p" className="vm-services-hero-description vm-hero-enter">{t("services.heroDescription")}</EditableText>
        <div className="vm-actions vm-hero-enter"><EditableLink href={withBasePath(t("services.heroPrimaryLink"))} data-preview-field-path="services.heroPrimaryLink" className="vm-button vm-button-primary"><EditableText id="services.heroPrimaryLabel">{t("services.heroPrimaryLabel")}</EditableText><Arrow /></EditableLink><EditableLink href={withBasePath(t("services.heroSecondaryLink"))} data-preview-field-path="services.heroSecondaryLink" targetPage="inventory" className="vm-text-link"><EditableText id="services.heroSecondaryLabel">{t("services.heroSecondaryLabel")}</EditableText><Arrow /></EditableLink></div>
      </div><figure className="vm-services-opening-photo vm-editorial-media"><VanguardImage id="services.heroImage" src={t("services.heroImage")} alt={t("services.heroImageAlt")} width={1800} height={1200} loading="eager" fetchPriority="high" /><figcaption><EditableText id="services.heroCaption">{t("services.heroCaption")}</EditableText></figcaption></figure></div></div>
    </header>
    <div className="vm-services-information">
    <nav ref={navigation.nav} className="vm-service-navigation" aria-label={t("services.indexLabel")}><div className="vm-container vm-service-directory" data-ready={navigation.ready ? "true" : undefined}
      style={{ "--service-column": activeIndex % 3, "--service-row": Math.floor(activeIndex / 3), "--service-rows": Math.max(1, Math.ceil(count / 3)), "--service-mobile-column": activeIndex % 2, "--service-mobile-row": Math.floor(activeIndex / 2), "--service-mobile-rows": Math.max(1, Math.ceil(count / 2)) } as CSSProperties}>
      <span className="vm-service-nav-indicator" hidden={!navigation.ready || !count} aria-hidden="true" />
      {content.services.items.map((service,index)=><a key={index} href={`#service-${index}`} className={navigation.active === `service-${index}` ? "is-active" : ""} aria-current={navigation.active === `service-${index}` ? "location" : undefined}
        onClick={event=>{if(navigation.ready && event.button===0 && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey && !(event.target as HTMLElement).isContentEditable){event.preventDefault();navigation.navigate(`service-${index}`,true);}}}>
        <span aria-hidden="true">{String(index+1).padStart(2,"0")}</span><EditableText id={`services.items.${index}.name`}>{service.name}</EditableText><Arrow /></a>)}
    </div></nav>
    <section id="offerings" className="vm-services-editorial"><div className="vm-container">
    <div className="vm-service-intro" data-reveal><EditableText id="services.title" as="h2" className="vm-title">{t("services.title")}</EditableText><div><EditableText id="services.description" as="p" className="vm-copy">{t("services.description")}</EditableText><EditableText id="services.demoNote" as="p" className="vm-services-note">{t("services.demoNote")}</EditableText></div></div>
    <div className="vm-service-editorial-grid">{content.services.items.map(servicePanel)}</div></div>
    </section>
    </div>
    <section className="vm-services-closing"><div className="vm-container vm-dark-surface" data-reveal><div><EditableText id="services.closingEyebrow" as="p" className="vm-eyebrow">{t("services.closingEyebrow")}</EditableText><EditableText id="services.closingTitle" as="h2" className="vm-title">{t("services.closingTitle")}</EditableText><EditableText id="services.closingDescription" as="p" className="vm-copy">{t("services.closingDescription")}</EditableText></div><EditableLink href={withBasePath(t("services.closingButtonLink"))} data-preview-field-path="services.closingButtonLink" targetPage="contact" className="vm-button vm-button-primary"><EditableText id="services.closingButtonLabel">{t("services.closingButtonLabel")}</EditableText><Arrow /></EditableLink></div></section>
  </main>;
}
