"use client";
import { useRef } from "react";
import { EditableBodyTypeCard, EditableBrandCard, EditableLink, EditableText, withBasePath } from "@deneb-ui/ui";
import { VanguardImage } from "./vanguard-image";
import { useSiteContent, type VehicleId } from "@/lib/site-content";
import { usePageEffects } from "./use-page-effects";
import { VehicleListing } from "./vehicle-listing";
import { Arrow } from "./vanguard-arrow";
import { HomeVehicleSearch } from "./home-vehicle-search";
import { VanguardReviews } from "./vanguard-reviews";

export function VanguardHome() {
 const { data, content, t, legacyMissing } = useSiteContent();
 const root = useRef<HTMLElement>(null);
 usePageEffects(root);
 const vehicleIds = Object.keys(content.cards.vehicles) as VehicleId[];
 const brandIds = Object.keys(content.cards.brands) as (keyof typeof content.cards.brands)[];
 const bodyIds = Object.keys(content.cards.bodyTypes) as (keyof typeof content.cards.bodyTypes)[];
 if (!data.requirements.requiredPages.includes("home")) return null;
 return <main id="main-content" ref={root} data-preview-page-key="home" className="vm-page vm-home-page">
 <section id="home" className="vm-hero" aria-labelledby="hero-title">
          <div className="vm-hero-image-wrap"><VanguardImage id="home.hero.image" src={t("home.hero.image")} alt={t("home.hero.imageAlt")} width={2000} height={1334} loading="eager" fetchPriority="high" className="vm-hero-image" /></div>
          <div className="vm-hero-shade" aria-hidden="true" />
          <div className="vm-container vm-hero-inner">
            <div className="vm-hero-copy">
              <EditableText id="home.hero.eyebrow" as="p" className="vm-eyebrow vm-hero-enter">{t("home.hero.eyebrow")}</EditableText>
              <h1 id="hero-title"><EditableText id="home.hero.title" className="vm-hero-line vm-hero-enter">{t("home.hero.title")}</EditableText><EditableText id="home.hero.titleAccent" className="vm-hero-line vm-hero-accent vm-hero-enter">{t("home.hero.titleAccent")}</EditableText></h1>
              <EditableText id="home.hero.description" as="p" className="vm-hero-description vm-hero-enter">{t("home.hero.description")}</EditableText>
              <div className="vm-actions vm-hero-enter">
                <EditableLink className="vm-button vm-button-primary" href={withBasePath(t("home.hero.primaryLink"))} targetPage="inventory" data-preview-field-path="home.hero.primaryLink"><EditableText id="home.hero.primaryLabel">{t("home.hero.primaryLabel")}</EditableText><Arrow /></EditableLink>
                <EditableLink className="vm-text-link" href={withBasePath(t("home.hero.secondaryLink"))} targetPage="about" data-preview-field-path="home.hero.secondaryLink"><EditableText id="home.hero.secondaryLabel">{t("home.hero.secondaryLabel")}</EditableText><Arrow /></EditableLink>
              </div>
            </div>
            <div className="vm-hero-bottom">
              <a href="#search" className="vm-scroll"><span className="vm-scroll-line" /><EditableText id="home.hero.scrollLabel">{t("home.hero.scrollLabel")}</EditableText></a>
              <div className="vm-hero-caption"><EditableText id="home.hero.imageCaption" as="p">{t("home.hero.imageCaption")}</EditableText><EditableText id="home.hero.imageSubcaption" as="p">{t("home.hero.imageSubcaption")}</EditableText></div>
              <EditableText id="home.hero.edition" className="vm-hero-edition">{t("home.hero.edition")}</EditableText>
            </div>
          </div>
        </section>

        <HomeVehicleSearch />

        <section className="vm-section vm-container vm-category-section" aria-label={t("home.bodyTypes.title")}><div className="vm-section-heading" data-reveal><div><EditableText id="home.bodyTypes.eyebrow" as="p" className="vm-eyebrow">{t("home.bodyTypes.eyebrow")}</EditableText><EditableText id="home.bodyTypes.title" as="h2" className="vm-title">{t("home.bodyTypes.title")}</EditableText></div></div><div data-target-page="inventory" className="vm-body-grid">
          {bodyIds.map(id => <div key={id} data-reveal data-browse={id}><EditableBodyTypeCard typeSlug={id} href={withBasePath(`/inventory?bodyType=${id}`)} className="vm-body-card" imageSlot={<div className="vm-body-image-wrap"><VanguardImage id={`cards.bodyTypes.${id}.image`} src={t(`cards.bodyTypes.${id}.image`)} alt={t(`cards.bodyTypes.${id}.imageAlt`)} width={800} height={600} loading="lazy" /></div>}><Arrow />{legacyMissing(`cards.bodyTypes.${id}.description`) && <EditableText id={`cards.bodyTypes.${id}.description`} className="vm-empty-target">{t(`cards.bodyTypes.${id}.description`)}</EditableText>}</EditableBodyTypeCard></div>)}
        </div></section>
<section id="brands" data-target-page="inventory" className="vm-brands-section" aria-label={t("home.brands.title")}><div className="vm-container" data-reveal><div className="vm-brands-heading"><EditableText id="home.brands.eyebrow" as="p" className="vm-eyebrow">{t("home.brands.eyebrow")}</EditableText><EditableText id="home.brands.title" as="h2">{t("home.brands.title")}</EditableText></div><div className="vm-brand-grid">
          {brandIds.map(id => <div key={id} className="vm-browse-wrap" data-browse={id} data-reveal><EditableBrandCard makeSlug={id} href={withBasePath(`/inventory?brand=${id}`)} className={`vm-brand-card vm-marque-${id}`}><div className="vm-brand-logo"><VanguardImage id={`cards.brands.${id}.image`} src={t(`cards.brands.${id}.image`)} fallbackSrc="/images/brands/placeholder.svg" alt={t(`cards.brands.${id}.imageAlt`)} width={160} height={100} /></div></EditableBrandCard></div>)}
        </div></div></section>

        <section id="collection" data-target-page="inventory" className="vm-section vm-container" aria-label={t("home.collection.title")}>
          <div className="vm-section-heading" data-reveal><div><EditableText id="home.collection.eyebrow" as="p" className="vm-eyebrow">{t("home.collection.eyebrow")}</EditableText><EditableText id="home.collection.title" as="h2" className="vm-title" aria-label={t("home.collection.title")} data-section-heading="collection">{t("home.collection.title")}</EditableText></div><EditableText id="home.collection.description" as="p" className="vm-section-description">{t("home.collection.description")}</EditableText></div>
          <div className="vm-collection-toolbar"><EditableLink href={withBasePath(t("home.collection.allLink"))} data-preview-field-path="home.collection.allLink" targetPage="inventory" className="vm-text-link"><EditableText id="home.collection.allLabel">{t("home.collection.allLabel")}</EditableText><Arrow /></EditableLink><p className="vm-results">{String(Math.min(3, vehicleIds.length)).padStart(2, "0")} <EditableText id="home.collection.resultsLabel">{t("home.collection.resultsLabel")}</EditableText></p></div><div className="vm-vehicle-grid vm-featured-grid">
  {vehicleIds.slice(0, 3).map((id, index) => <div key={id} className="vm-vehicle-wrap" data-reveal><VehicleListing id={id} index={index} /></div>)}
  </div></section>

        <section className="vm-home-services" data-target-page="services"><div className="vm-container">
          <div className="vm-section-heading" data-reveal><div><EditableText id="home.servicesPreview.eyebrow" as="p" className="vm-eyebrow">{t("home.servicesPreview.eyebrow")}</EditableText><EditableText id="home.servicesPreview.title" as="h2" className="vm-title">{t("home.servicesPreview.title")}</EditableText></div><div className="vm-home-services-aside"><EditableText id="home.servicesPreview.description" as="p" className="vm-copy vm-home-services-intro">{t("home.servicesPreview.description")}</EditableText><EditableLink href={withBasePath(t("home.servicesPreview.buttonLink"))} data-preview-field-path="home.servicesPreview.buttonLink" targetPage="services" className="vm-text-link"><EditableText id="home.servicesPreview.buttonLabel">{t("home.servicesPreview.buttonLabel")}</EditableText><Arrow /></EditableLink></div></div>
          <div className="vm-home-service-grid">{[0,3,4].map(index=>{const service=content.services.items[index];const path=`services.items.${index}`;return <EditableLink key={index} href={withBasePath(t("home.servicesPreview.buttonLink"))+`#service-${index}`} targetPage="services" className="vm-home-service" data-reveal><VanguardImage id={`${path}.imageUrl`} src={service.imageUrl} alt={service.name} width={900} height={600} /><div><EditableText id={`${path}.name`} as="h3">{service.name}</EditableText><EditableText id={`home.servicesPreview.summaries.${index}`} as="p">{t(`home.servicesPreview.summaries.${index}`)}</EditableText><Arrow /></div></EditableLink>})}</div>
          <EditableText id="home.servicesPreview.demoNote" as="p" className="vm-home-services-note">{t("home.servicesPreview.demoNote")}</EditableText>
        </div></section>


        <VanguardReviews />

        
 <section className="vm-section vm-container vm-home-cta" data-reveal><div><EditableText id="home.cta.eyebrow" as="p" className="vm-eyebrow">{t("home.cta.eyebrow")}</EditableText><EditableText id="home.cta.title" as="h2" className="vm-title">{t("home.cta.title")}</EditableText><EditableText id="home.cta.description" as="p" className="vm-copy">{t("home.cta.description")}</EditableText></div><EditableLink href={withBasePath(t("home.cta.buttonLink"))} data-preview-field-path="home.cta.buttonLink" targetPage="contact" className="vm-button vm-button-primary"><EditableText id="home.cta.buttonLabel">{t("home.cta.buttonLabel")}</EditableText><Arrow /></EditableLink></section>
 </main>;
}
