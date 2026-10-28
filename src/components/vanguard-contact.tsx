"use client";

import { useRef, useEffect, useState } from "react";
import { EditableLink, EditableShowroomCard, EditableText, withBasePath } from "@deneb-ui/ui";
import { VanguardImage } from "./vanguard-image";
import { useSiteContent } from "@/lib/site-content";
import { usePageEffects } from "./use-page-effects";
import { InquiryForm } from "./inquiry-form";
import { Arrow } from "./vanguard-arrow";
import { VanguardFaq } from "./vanguard-faq";

export function VanguardContact() {
  const { data, content, t, legacyMissing } = useSiteContent();
  const root = useRef<HTMLElement>(null);
  usePageEffects(root);
  const [vehicleId, setVehicleId] = useState("");
  const [inquiryType, setInquiryType] = useState("");
  useEffect(() => {
    const restore = () => {
      const id = new URLSearchParams(window.location.search).get("vehicle") || "";
      setVehicleId(Object.hasOwn(content.cards.vehicles, id) ? id : "");
      const inquiry = new URLSearchParams(window.location.search).get("inquiry") || "";
      setInquiryType(content.requests.types.some(type=>type.key===inquiry) ? inquiry : "");
    };
    restore(); window.addEventListener("popstate", restore);
    return () => window.removeEventListener("popstate", restore);
  }, [content.cards.vehicles, content.requests.types]);
  const selected = content.cards.vehicles[vehicleId as keyof typeof content.cards.vehicles];
  if (!data.requirements.requiredPages.includes("contact")) return null;
  return <main id="main-content" ref={root} className="vm-page vm-contact-page vm-editorial-page" data-preview-page-key="contact">
    <header className="vm-contact-opening vm-dark-surface"><div className="vm-container vm-editorial-hero vm-contact-hero">
      <div className="vm-editorial-heading">
        <EditableText id="home.contact.eyebrow" as="p" className="vm-eyebrow vm-hero-enter">{t("home.contact.eyebrow")}</EditableText>
        <EditableText id="home.contact.title" as="h1" className="vm-title vm-editorial-title vm-hero-enter">{t("home.contact.title")}</EditableText>
        <EditableText id="home.contact.description" as="p" className="vm-copy vm-hero-enter">{t("home.contact.description")}</EditableText>
        <div className="vm-actions vm-hero-enter"><EditableLink href={withBasePath(t("contact.heroCtaLink"))} data-preview-field-path="contact.heroCtaLink" className="vm-button vm-button-primary"><EditableText id="contact.heroCtaLabel">{t("contact.heroCtaLabel")}</EditableText><Arrow /></EditableLink></div>
      </div>
      <figure className="vm-editorial-photo vm-editorial-media" data-reveal><VanguardImage id="contact.heroImage" src={t("contact.heroImage")} alt={t("contact.heroImageAlt")} width={1600} height={1067} loading="eager" fetchPriority="high" /><figcaption><EditableText id="contact.imageCaption">{t("contact.imageCaption")}</EditableText></figcaption></figure>
    </div></header>
    <section className="vm-container vm-contact-details" aria-label={t("contact.locationTitle")}>
      <div><div className="vm-contact-detail-header"><span aria-hidden="true">01</span><EditableText id="contact.emailTitle" as="h2">{t("contact.emailTitle")}</EditableText></div><EditableLink href={t("home.contact.emailLink")} data-preview-field-path="home.contact.emailLink"><EditableText id="common.business.email">{t("common.business.email")}</EditableText><Arrow /></EditableLink><EditableText id="home.contact.emailLabel" as="p" className="vm-contact-detail-note">{t("home.contact.emailLabel")}</EditableText></div>
      <div><div className="vm-contact-detail-header"><span aria-hidden="true">02</span><EditableText id="contact.phoneTitle" as="h2">{t("contact.phoneTitle")}</EditableText></div><EditableLink href={t("home.contact.phoneLink")} data-preview-field-path="home.contact.phoneLink"><EditableText id="common.business.phone">{t("common.business.phone")}</EditableText><Arrow /></EditableLink><EditableText id="home.contact.phoneLabel" as="p" className="vm-contact-detail-note">{t("home.contact.phoneLabel")}</EditableText></div>
      <div><div className="vm-contact-detail-header"><span aria-hidden="true">03</span><EditableText id="contact.locationTitle" as="h2">{t("contact.locationTitle")}</EditableText></div><EditableShowroomCard showroomId="flagship" className="vm-showroom-card">{legacyMissing("showrooms.flagship.notes") && <EditableText id="showrooms.flagship.notes" className="vm-empty-target">{t("showrooms.flagship.notes")}</EditableText>}</EditableShowroomCard></div>
    </section>
    <div className="vm-container vm-contact-demo"><EditableText id="home.contact.demoNote" as="p">{t("home.contact.demoNote")}</EditableText><EditableText id="contact.visitNote" as="p">{t("contact.visitNote")}</EditableText></div>
    <section id="contact" className="vm-container vm-contact-composer">
      <div className="vm-contact-form-copy vm-dark-surface" data-reveal>
        <EditableText id="contact.formEyebrow" as="p" className="vm-eyebrow">{t("contact.formEyebrow")}</EditableText><EditableText id="contact.formTitle" as="h2" className="vm-title">{t("contact.formTitle")}</EditableText><EditableText id="contact.formDescription" as="p" className="vm-copy">{t("contact.formDescription")}</EditableText>
        <div className="vm-selected-vehicle" hidden={!selected}><EditableText id="contact.selectedLabel">{t("contact.selectedLabel")}</EditableText><p>{selected?.name}</p><EditableText id="contact.selectedNote">{t("contact.selectedNote")}</EditableText></div>
        <EditableLink href={withBasePath(t("contact.collectionLink"))} data-preview-field-path="contact.collectionLink" targetPage="inventory" className="vm-text-link"><EditableText id="contact.collectionLabel">{t("contact.collectionLabel")}</EditableText><Arrow /></EditableLink>
      </div>
      <InquiryForm mode="contact" vehicleId={vehicleId} onVehicleChange={setVehicleId} inquiryType={inquiryType} />
    </section>
    <VanguardFaq />
  </main>;
}
