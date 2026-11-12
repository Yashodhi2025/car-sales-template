"use client";

import { useRef } from "react";
import { EditableIcon, EditableLink, EditableServiceCard, EditableText, withBasePath } from "@deneb-ui/ui";
import { useSiteContent } from "@/lib/site-content";
import { Arrow } from "./vanguard-arrow";
import { usePageEffects } from "./use-page-effects";
import { VanguardImage } from "./vanguard-image";
import styles from "./vanguard-services.module.css";

export function VanguardServices() {
  const { data, content, t } = useSiteContent();
  const root = useRef<HTMLElement>(null);
  usePageEffects(root);
  if (!data.requirements.requiredPages.includes("services")) return null;

  function servicePanel(service: typeof content.services.items[number], index: number) {
    const path = `services.items.${index}`;
    const { imageUrl, ...copy } = service;
    return <article key={index} id={`service-${index}`} className={styles.card} data-preview-item-path={path} data-reveal>
      <div className={styles.cardMedia}><VanguardImage id={`${path}.imageUrl`} src={imageUrl} alt={service.name} width={960} height={460} /></div>
      <EditableServiceCard as="div" itemPath={path} service={{ ...copy, name: t(`${path}.name`), description: t(`${path}.description`) }} showPrice={false} showStatusBadge={false} className={styles.copy}>
        <span className={styles.serviceIcon}><EditableIcon fieldPath={`${path}.icon`} name={service.icon} size={20} /></span>
        <div className={styles.cardFooter}>
          <div className={styles.detailsBody}>
            <EditableText id={`${path}.kicker`} as="p" className={styles.kicker}>{t(`${path}.kicker`)}</EditableText>
            <ul data-preview-list-path={`${path}.includes`}>{service.includes.map((item, itemIndex) => <li key={itemIndex} data-preview-item-path={`${path}.includes.${itemIndex}`}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/></svg><EditableText id={`${path}.includes.${itemIndex}.name`}>{item.name}</EditableText></li>)}</ul>
          </div>
          <div className={styles.cardActions}>
            {index === 2 && <EditableLink href={withBasePath(t("services.financeContactLink"))} data-preview-field-path="services.financeContactLink" targetPage="contact" className={styles.financeLink}><EditableText id="services.financeContactLabel">{t("services.financeContactLabel")}</EditableText><Arrow /></EditableLink>}
            <EditableLink href={withBasePath(service.buttonLink)} data-preview-field-path={`${path}.buttonLink`} targetPage={service.targetPage} className={styles.serviceAction}><EditableText id={`${path}.buttonLabel`}>{service.buttonLabel}</EditableText><Arrow /></EditableLink>
          </div>
        </div>
      </EditableServiceCard>
    </article>;
  }

  return <main id="main-content" ref={root} className={`vm-page vm-services-page ${styles.page}`} data-preview-page-key="services">
    <header className={`vm-services-hero vm-dark-surface ${styles.hero}`}>
      <div className={`vm-container ${styles.heroInner}`}>
        <div className={styles.heroCopy}>
          <EditableText id="services.eyebrow" as="p" className="vm-eyebrow vm-hero-enter">{t("services.eyebrow")}</EditableText>
          <EditableText id="services.heroTitle" as="h1" className={`${styles.heroTitle} vm-hero-enter`}>{t("services.heroTitle")}</EditableText>
          <EditableText id="services.heroDescription" as="p" className={`${styles.heroDescription} vm-services-hero-description vm-hero-enter`}>{t("services.heroDescription")}</EditableText>
          <div className={`${styles.heroActions} vm-hero-enter`}>
            <EditableLink href={withBasePath(t("services.heroPrimaryLink"))} data-preview-field-path="services.heroPrimaryLink" className="vm-button vm-button-primary"><EditableText id="services.heroPrimaryLabel">{t("services.heroPrimaryLabel")}</EditableText><Arrow /></EditableLink>
            <EditableLink href={withBasePath(t("services.heroSecondaryLink"))} data-preview-field-path="services.heroSecondaryLink" targetPage="contact" className="vm-button vm-button-outline"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M21 11a8 8 0 0 1-8 8H5l-3 3V11a9 9 0 1 1 19 0Z"/></svg><EditableText id="services.heroSecondaryLabel">{t("services.heroSecondaryLabel")}</EditableText></EditableLink>
          </div>
        </div>
        <figure className={styles.heroPhoto}>
          <VanguardImage id="services.heroImage" src={t("services.heroImage")} alt={t("services.heroImageAlt")} width={1600} height={900} loading="eager" fetchPriority="high" />
          <figcaption><EditableText id="services.indexLabel">{t("services.indexLabel")}</EditableText><EditableText id="services.heroCaption">{t("services.heroCaption")}</EditableText></figcaption>
        </figure>
      </div>
    </header>

    <section className={`${styles.trust} vm-dark-surface`} aria-label={t("services.title")}>
      <ul className={`vm-container ${styles.trustGrid}`} data-preview-list-path="services.trustFeatures">
        {content.services.trustFeatures.map((feature, index) => {
          const path = `services.trustFeatures.${index}`;
          return <li key={index} data-preview-item-path={path}><EditableIcon fieldPath={`${path}.icon`} name={feature.icon} size={23} /><div><EditableText id={`${path}.title`} as="h2">{feature.title}</EditableText><EditableText id={`${path}.text`} as="p">{feature.text}</EditableText></div></li>;
        })}
      </ul>
    </section>

    <section id="offerings" className={styles.offerings} aria-label={t("services.title")}>
      <div className="vm-container">
        <div className={styles.sectionHeading} data-reveal><div><EditableText id="services.offeringsEyebrow" as="p" className="vm-eyebrow">{t("services.offeringsEyebrow")}</EditableText><EditableText id="services.title" as="h2" className={styles.sectionTitle}>{t("services.title")}</EditableText><EditableText id="services.description" as="p" className={styles.sectionDescription}>{t("services.description")}</EditableText></div><EditableLink href={withBasePath(t("services.viewAllLink"))} data-preview-field-path="services.viewAllLink" className={styles.viewAll}><EditableText id="services.viewAllLabel">{t("services.viewAllLabel")}</EditableText><Arrow /></EditableLink></div>
        <div id="services-grid" tabIndex={-1} className={styles.grid} data-preview-list-path="services.items">{content.services.items.map(servicePanel)}</div>
        <EditableText id="services.demoNote" as="p" className={styles.demoNote}>{t("services.demoNote")}</EditableText>
      </div>
    </section>

    <section className={styles.process} aria-label={t("services.processTitle")}>
      <div className="vm-container">
        <div className={styles.processHeading} data-reveal><div><EditableText id="services.processEyebrow" as="p" className="vm-eyebrow">{t("services.processEyebrow")}</EditableText><EditableText id="services.processTitle" as="h2" className={styles.sectionTitle}>{t("services.processTitle")}</EditableText></div><EditableText id="services.processDescription" as="p" className={styles.sectionDescription}>{t("services.processDescription")}</EditableText></div>
        <ol className={styles.steps} data-preview-list-path="services.steps">
          {content.services.steps.map((step, index) => {
            const path = `services.steps.${index}`;
            return <li key={index} data-preview-item-path={path} data-reveal><EditableText id={`${path}.number`} as="div" className={styles.stepNumber}>{step.number}</EditableText><div className={styles.stepCopy}><EditableText id={`${path}.title`} as="h3">{step.title}</EditableText><EditableText id={`${path}.text`} as="p">{step.text}</EditableText></div>{index < content.services.steps.length - 1 && <Arrow />}</li>;
          })}
        </ol>
      </div>
    </section>

    <section className={styles.closing} aria-label={t("services.closingTitle")}>
      <div className={`vm-container ${styles.banner} vm-dark-surface`} data-reveal>
        <div className={styles.bannerPhoto}><VanguardImage id="services.closingImage" src={t("services.closingImage")} alt={t("services.closingImageAlt")} width={1100} height={700} /></div>
        <div className={styles.bannerCopy}>
          <EditableText id="services.closingEyebrow" as="p" className="vm-eyebrow">{t("services.closingEyebrow")}</EditableText>
          <EditableText id="services.closingTitle" as="h2" className={styles.bannerTitle}>{t("services.closingTitle")}</EditableText>
          <EditableText id="services.closingDescription" as="p" className={styles.bannerDescription}>{t("services.closingDescription")}</EditableText>
          <div className={styles.bannerActions}><EditableLink href={withBasePath(t("services.closingButtonLink"))} data-preview-field-path="services.closingButtonLink" targetPage="contact" className="vm-button vm-button-primary"><EditableText id="services.closingButtonLabel">{t("services.closingButtonLabel")}</EditableText><Arrow /></EditableLink><EditableLink href={t("home.contact.phoneLink")} data-preview-field-path="home.contact.phoneLink" className="vm-button vm-button-outline"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m7 3 3 5-2 2a14 14 0 0 0 6 6l2-2 5 3v3a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3Z"/></svg><EditableText id="services.closingPhoneLabel">{t("services.closingPhoneLabel")}</EditableText></EditableLink></div>
        </div>
      </div>
    </section>
  </main>;
}
