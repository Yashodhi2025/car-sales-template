"use client";

import { useRef } from "react";
import { EditableIcon, EditableLink, EditableText, withBasePath } from "@deneb-ui/ui";
import { VanguardImage } from "./vanguard-image";
import { useSiteContent } from "@/lib/site-content";
import { usePageEffects } from "./use-page-effects";
import { Arrow } from "./vanguard-arrow";
import styles from "./vanguard-about.module.css";

function ContactIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M21 11a8 8 0 0 1-8 8H5l-3 3V11a9 9 0 1 1 19 0Z"/></svg>;
}

export function VanguardAbout() {
  const { data, content, t } = useSiteContent();
  const root = useRef<HTMLElement>(null);
  usePageEffects(root);
  if (!data.requirements.requiredPages.includes("about")) return null;

  return <main id="main-content" ref={root} className={`vm-page vm-about-page ${styles.page}`} data-preview-page-key="about">
    <header className={`${styles.hero} vm-dark-surface`}>
      <div className={styles.heroPhoto}><VanguardImage id="about.heroImage" src={t("about.heroImage")} alt={t("about.heroImageAlt")} width={1600} height={900} loading="eager" fetchPriority="high" /><EditableText id="about.imageCaption" as="p" className={styles.heroCaption}>{t("about.imageCaption")}</EditableText></div>
      <div className={`vm-container ${styles.heroInner}`}>
        <div className={styles.heroCopy}>
          <EditableText id="about.eyebrow" as="p" className="vm-eyebrow vm-hero-enter">{t("about.eyebrow")}</EditableText>
          <EditableText id="about.title" as="h1" className={`${styles.heroTitle} vm-hero-enter`}>{t("about.title")}</EditableText>
          <EditableText id="about.description" as="p" className={`${styles.heroDescription} vm-hero-enter`}>{t("about.description")}</EditableText>
          <div className={`${styles.actions} vm-hero-enter`}>
            <EditableLink href={withBasePath(t("about.inventoryLink"))} data-preview-field-path="about.inventoryLink" targetPage="inventory" className="vm-button vm-button-primary"><EditableText id="about.inventoryLabel">{t("about.inventoryLabel")}</EditableText><Arrow /></EditableLink>
            <EditableLink href={withBasePath(t("about.contactLink"))} data-preview-field-path="about.contactLink" targetPage="contact" className="vm-button vm-button-outline"><ContactIcon /><EditableText id="about.contactLabel">{t("about.contactLabel")}</EditableText></EditableLink>
          </div>
        </div>
      </div>
    </header>

    <div className="vm-container">
      <figure id="experience" className={styles.showroom} data-reveal>
        <div className={styles.showroomPhoto}>
          <VanguardImage id="home.experience.image" src={t("home.experience.image")} alt={t("home.experience.imageAlt")} width={1800} height={1200} />
        </div>
        <div className={`${styles.brandPanel} vm-dark-surface`}>
          <VanguardImage id="common.logoUrl" src={t("common.logoUrl")} alt="" width={52} height={52} />
          <EditableText id="common.websiteTitle" as="p" className={styles.brandName}>{t("common.websiteTitle")}</EditableText>
          <EditableText id="home.experience.signature" as="p" className={styles.signature}>{t("home.experience.signature")}</EditableText>
        </div>
        <figcaption><EditableText id="home.experience.imageCaption">{t("home.experience.imageCaption")}</EditableText></figcaption>
      </figure>

      <section className={styles.story} aria-label={t("about.storyEyebrow")}>
        <div data-reveal><EditableText id="about.storyEyebrow" as="p" className="vm-eyebrow">{t("about.storyEyebrow")}</EditableText><EditableText id="about.storyTitle" as="h2" className={styles.sectionTitle}>{t("about.storyTitle")}</EditableText></div>
        <div className={styles.storyCopy} data-reveal><EditableText id="about.storyDescription" as="p">{t("about.storyDescription")}</EditableText><EditableText id="about.storyNote" as="p">{t("about.storyNote")}</EditableText></div>
      </section>

      <section id="approach" className={styles.values} aria-label={t("home.promise.eyebrow")}>
        <EditableText id="home.promise.eyebrow" as="h2" className="vm-eyebrow">{t("home.promise.eyebrow")}</EditableText>
        <div className={styles.valuesGrid} data-preview-list-path="home.benefits">
          {content.home.benefits.map((item, index) => {
            const path = `home.benefits.${index}`;
            return <article key={index} data-preview-item-path={path} data-reveal><EditableIcon fieldPath={`${path}.icon`} name={item.icon} size={27} /><EditableText id={`${path}.title`} as="h3">{item.title}</EditableText><EditableText id={`${path}.text`} as="p">{item.text}</EditableText></article>;
          })}
        </div>
      </section>

      <section className={styles.journey} aria-label={t("about.journeyTitle")}>
        <div className={styles.journeyHeading} data-reveal><div><EditableText id="about.journeyEyebrow" as="p" className="vm-eyebrow">{t("about.journeyEyebrow")}</EditableText><EditableText id="about.journeyTitle" as="h2" className={styles.sectionTitle}>{t("about.journeyTitle")}</EditableText></div><EditableText id="about.journeyDescription" as="p" className={styles.journeyDescription}>{t("about.journeyDescription")}</EditableText></div>
        <ol className={styles.journeyGrid} data-preview-list-path="about.journey">
          {content.about.journey.map((step,index) => {
            const path = `about.journey.${index}`;
            return <li key={index} data-preview-item-path={path} data-reveal><div className={styles.journeyTop}><EditableText id={`${path}.number`} as="div" className={styles.journeyNumber}>{step.number}</EditableText>{index < content.about.journey.length - 1 && <span className={styles.journeyLine} aria-hidden="true" />}</div><EditableText id={`${path}.title`} as="h3">{step.title}</EditableText><EditableText id={`${path}.text`} as="p">{step.text}</EditableText></li>;
          })}
        </ol>
      </section>

      <section className={`${styles.banner} vm-dark-surface`} aria-label={t("about.ctaTitle")} data-reveal>
        <div className={styles.bannerPhoto}><VanguardImage id="about.ctaImage" src={t("about.ctaImage")} alt={t("about.ctaImageAlt")} width={1400} height={800} /></div>
        <div className={styles.bannerCopy}>
          <EditableText id="home.experience.eyebrow" as="p" className="vm-eyebrow">{t("home.experience.eyebrow")}</EditableText>
          <EditableText id="about.ctaTitle" as="h2" className={styles.bannerTitle}>{t("about.ctaTitle")}</EditableText>
          <EditableText id="home.experience.description" as="p" className={styles.bannerDescription}>{t("home.experience.description")}</EditableText>
          <div className={styles.actions}><EditableLink href={withBasePath(t("about.inventoryLink"))} data-preview-field-path="about.inventoryLink" targetPage="inventory" className="vm-button vm-button-primary"><EditableText id="about.ctaInventoryLabel">{t("about.ctaInventoryLabel")}</EditableText><Arrow /></EditableLink><EditableLink href={withBasePath(t("home.experience.buttonLink"))} data-preview-field-path="home.experience.buttonLink" targetPage="contact" className="vm-button vm-button-outline"><ContactIcon /><EditableText id="home.experience.buttonLabel">{t("home.experience.buttonLabel")}</EditableText></EditableLink></div>
        </div>
      </section>
    </div>
  </main>;
}
