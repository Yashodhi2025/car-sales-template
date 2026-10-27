"use client";
import { useRef, useEffect, useState } from "react";
import { EditableImage, EditableLink, EditableShowroomCard, EditableText, withBasePath } from "@deneb-ui/ui";
import { useSiteContent } from "@/lib/site-content";
import { usePageEffects } from "./use-page-effects";
import { Arrow } from "./vanguard-arrow";

export function VanguardAbout() {
 const { data, content, t } = useSiteContent();
 const root = useRef<HTMLElement>(null); usePageEffects(root);
 if (!data.requirements.requiredPages.includes("about")) return null;
 return <main id="main-content" ref={root} className="vm-page vm-about-page" data-preview-page-key="about">
 <header className="vm-section vm-container vm-route-intro"><EditableText id="about.eyebrow" as="p" className="vm-eyebrow">{t("about.eyebrow")}</EditableText><EditableText id="about.title" as="h1" className="vm-title vm-route-title">{t("about.title")}</EditableText><EditableText id="about.description" as="p" className="vm-copy">{t("about.description")}</EditableText></header>
 <section id="approach" className="vm-promise-section"><div className="vm-section vm-container vm-promise-layout"><div data-reveal><EditableText id="home.promise.eyebrow" as="p" className="vm-eyebrow">{t("home.promise.eyebrow")}</EditableText><EditableText id="home.promise.title" as="h2" className="vm-title">{t("home.promise.title")}</EditableText><EditableText id="home.promise.description" as="p" className="vm-copy">{t("home.promise.description")}</EditableText><span className="vm-promise-rule" aria-hidden="true" /></div><div className="vm-benefits">
          {content.home.benefits.map((item, i) => <article key={i} data-preview-item-path={`home.benefits.${i}`} data-reveal><EditableText id={`home.benefits.${i}.number`} className="vm-benefit-number">{item.number}</EditableText><div><EditableText id={`home.benefits.${i}.title`} as="h3">{item.title}</EditableText><EditableText id={`home.benefits.${i}.text`} as="p">{item.text}</EditableText></div><Arrow /></article>)}
        </div></div></section>

        <section id="experience" className="vm-section vm-container vm-experience"><figure className="vm-experience-figure" data-reveal><div className="vm-experience-image-wrap"><EditableImage id="home.experience.image" src={t("home.experience.image")} alt={t("home.experience.imageAlt")} width={1200} height={1400} loading="lazy" /></div><figcaption><span aria-hidden="true" className="vm-caption-line" /><EditableText id="home.experience.imageCaption">{t("home.experience.imageCaption")}</EditableText></figcaption></figure><div className="vm-experience-copy" data-reveal><EditableText id="home.experience.eyebrow" as="p" className="vm-eyebrow">{t("home.experience.eyebrow")}</EditableText><EditableText id="home.experience.title" as="h2" className="vm-title">{t("home.experience.title")}</EditableText><EditableText id="home.experience.description" as="p" className="vm-copy">{t("home.experience.description")}</EditableText><EditableLink className="vm-button vm-button-outline" href={withBasePath(t("home.experience.buttonLink"))} targetPage="contact" data-preview-field-path="home.experience.buttonLink"><EditableText id="home.experience.buttonLabel">{t("home.experience.buttonLabel")}</EditableText><Arrow /></EditableLink><EditableText id="home.experience.signature" as="p" className="vm-signature">{t("home.experience.signature")}</EditableText></div></section>

        
 </main>;
}
