"use client";
import { useRef, type MouseEvent } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { EditableImage, EditableText, withBasePath } from "@deneb-ui/ui";
import { useSiteContent } from "@/lib/site-content";
import { Arrow } from "./vanguard-arrow";
const pageForNav = { home: "home", collection: "inventory", experience: "about", contact: "contact" } as const;
export function VanguardShell({ children }: { children: React.ReactNode }) {
 const { data, t } = useSiteContent();
 const pathname = usePathname();
 const root = useRef<HTMLDivElement>(null);
 const navIds = (Object.keys(pageForNav) as (keyof typeof pageForNav)[]).filter(id => data.requirements.requiredPages.includes(pageForNav[id]));
 const closeMenu = (event: MouseEvent<HTMLElement>) => { if ((event.target as HTMLElement).closest("a")) event.currentTarget.closest("details")?.removeAttribute("open"); };
 return <div className="vanguard" id="site-top" ref={root}><style data-vanguard-page-visibility>{"/* Vanguard selected pages */\n" + Object.values(pageForNav).filter(page => !data.requirements.requiredPages.includes(page)).map(page => `[data-target-page="${page}"]{display:none!important}`).join("\n")}</style><a className="vm-skip" href="#main-content">Skip to content</a><header className="vm-header">
        <div className="vm-container vm-header-inner">
          <a href={withBasePath("/")} className="vm-brand" aria-label={t("common.websiteTitle")}>
            <EditableImage id="common.logoUrl" src={t("common.logoUrl")} alt="" width={36} height={36} className="vm-logo" />
            <EditableText id="common.websiteTitle">{t("common.websiteTitle")}</EditableText>
          </a>
          <nav className="vm-desktop-nav" aria-label="Main navigation">
            {navIds.map(id => <Link key={id} href={t(`common.navLinks.${id}`)} data-target-page={pageForNav[id]} aria-current={pathname === t(`common.navLinks.${id}`) ? "page" : undefined} data-preview-field-path={`common.navLinks.${id}`}><EditableText id={`common.navLabels.${id}`}>{t(`common.navLabels.${id}`)}</EditableText></Link>)}
          </nav>
          {data.requirements.requiredPages.includes("contact") && <Link data-target-page="contact" className="vm-nav-cta" href={t("common.headerCtaLink")} data-preview-field-path="common.headerCtaLink"><EditableText id="common.headerCtaLabel">{t("common.headerCtaLabel")}</EditableText><Arrow /></Link>}
          <details className="vm-mobile-menu" onKeyDown={event => { if (event.key === "Escape") { event.currentTarget.open = false; event.currentTarget.querySelector("summary")?.focus(); } }}>
            <summary aria-label="Toggle navigation"><span /><span /></summary>
            <nav aria-label="Mobile navigation" onClick={closeMenu}>
              {navIds.map(id => <Link key={id} href={t(`common.navLinks.${id}`)} data-target-page={pageForNav[id]} aria-current={pathname === t(`common.navLinks.${id}`) ? "page" : undefined} data-preview-field-path={`common.navLinks.${id}`}><EditableText id={`common.navLabels.${id}`}>{t(`common.navLabels.${id}`)}</EditableText><Arrow /></Link>)}
            </nav>
          </details>
        </div>
      </header>{children}<footer className="vm-footer"><div className="vm-container"><div className="vm-footer-main"><div className="vm-footer-brand"><a className="vm-brand" href={withBasePath("/")}><EditableImage id="common.logoUrl" src={t("common.logoUrl")} width={36} height={36} alt="" className="vm-logo" /><EditableText id="common.websiteTitle">{t("common.websiteTitle")}</EditableText></a><EditableText id="common.shortDescription" as="p" className="vm-copy">{t("common.shortDescription")}</EditableText></div><div><EditableText id="common.footerExplore" as="h2" className="vm-footer-heading">{t("common.footerExplore")}</EditableText><nav aria-label="Footer navigation">{navIds.map(id => <Link key={id} href={t(`common.navLinks.${id}`)} data-target-page={pageForNav[id]} aria-current={pathname === t(`common.navLinks.${id}`) ? "page" : undefined} data-preview-field-path={`common.navLinks.${id}`}><EditableText id={`common.navLabels.${id}`}>{t(`common.navLabels.${id}`)}</EditableText></Link>)}</nav></div><div><EditableText id="common.footerContact" as="h2" className="vm-footer-heading">{t("common.footerContact")}</EditableText><a href={`mailto:${t("common.business.email")}`}><EditableText id="common.business.email">{t("common.business.email")}</EditableText></a><a href={`tel:${t("common.business.phone").replace("(0)", "").replace(/[^+\d]/g, "")}`}><EditableText id="common.business.phone">{t("common.business.phone")}</EditableText></a><EditableText id="common.business.whatsapp" className="vm-empty-target">{t("common.business.whatsapp")}</EditableText></div></div><div className="vm-footer-bottom"><div><EditableText id="common.copyright" as="p">{t("common.copyright")}</EditableText><EditableText id="common.demoNotice" as="p" className="vm-demo-notice">{t("common.demoNotice")}</EditableText></div><a href="#site-top" className="vm-back-top"><EditableText id="common.backToTop">{t("common.backToTop")}</EditableText><span aria-hidden="true">↑</span></a></div></div></footer></div>;
}
