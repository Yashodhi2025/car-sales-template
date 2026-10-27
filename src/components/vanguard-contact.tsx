"use client";
import { useRef, useEffect, useState } from "react";
import { EditableImage, EditableLink, EditableShowroomCard, EditableText, withBasePath } from "@deneb-ui/ui";
import { useSiteContent } from "@/lib/site-content";
import { usePageEffects } from "./use-page-effects";
import { Arrow } from "./vanguard-arrow";

export function VanguardContact() {
 const { data, content, t, legacyMissing } = useSiteContent();
 const root = useRef<HTMLElement>(null); usePageEffects(root);
 const [vehicleId, setVehicleId] = useState("");
 useEffect(() => { setVehicleId(new URLSearchParams(window.location.search).get("vehicle") || ""); }, []);
 const selected = content.cards.vehicles[vehicleId as keyof typeof content.cards.vehicles];
 if (!data.requirements.requiredPages.includes("contact")) return null;
 return <main id="main-content" ref={root} className="vm-page vm-contact-page" data-preview-page-key="contact">
 <div className="vm-container vm-selected-vehicle" hidden={!selected}><EditableText id="contact.selectedLabel">{t("contact.selectedLabel")}</EditableText><p>{selected?.name}</p><EditableText id="contact.selectedNote">{t("contact.selectedNote")}</EditableText></div>
 <section id="contact" className="vm-section vm-container vm-contact"><div data-reveal><EditableText id="home.contact.eyebrow" as="p" className="vm-eyebrow">{t("home.contact.eyebrow")}</EditableText><EditableText id="home.contact.title" as="h1" className="vm-title vm-contact-title">{t("home.contact.title")}</EditableText><EditableText id="home.contact.description" as="p" className="vm-copy">{t("home.contact.description")}</EditableText><div className="vm-actions"><EditableLink className="vm-button vm-button-primary" href={withBasePath(t("home.contact.emailLink"))} data-preview-field-path="home.contact.emailLink"><EditableText id="home.contact.emailLabel">{t("home.contact.emailLabel")}</EditableText><Arrow /></EditableLink><EditableLink className="vm-text-link" href={withBasePath(t("home.contact.phoneLink"))} data-preview-field-path="home.contact.phoneLink"><EditableText id="home.contact.phoneLabel">{t("home.contact.phoneLabel")}</EditableText><Arrow /></EditableLink></div></div><div className="vm-showroom-wrap" data-reveal><span className="vm-location-icon" aria-hidden="true"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" /><circle cx="12" cy="10" r="2" /></svg></span><EditableShowroomCard showroomId="flagship" className="vm-showroom-card">{legacyMissing("showrooms.flagship.notes") && <EditableText id="showrooms.flagship.notes" className="vm-empty-target">{t("showrooms.flagship.notes")}</EditableText>}</EditableShowroomCard><EditableText id="home.contact.demoNote" as="p" className="vm-demo-note">{t("home.contact.demoNote")}</EditableText></div></section>
      
 <div className="vm-container vm-contact-return"><EditableLink href={withBasePath(t("contact.collectionLink"))} data-preview-field-path="contact.collectionLink" targetPage="inventory" className="vm-text-link"><Arrow back /><EditableText id="contact.collectionLabel">{t("contact.collectionLabel")}</EditableText></EditableLink></div>
 </main>;
}
