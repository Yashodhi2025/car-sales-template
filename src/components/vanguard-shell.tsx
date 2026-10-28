"use client";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { EditableImage, EditableText, withBasePath } from "@deneb-ui/ui";
import { useSiteContent } from "@/lib/site-content";
import { Arrow } from "./vanguard-arrow";
const pageForNav = { home: "home", collection: "inventory", services: "services", experience: "about", contact: "contact" } as const;
export function VanguardShell({ children }: { children: React.ReactNode }) {
 const { data, t } = useSiteContent();
 const pathname = usePathname();
 const root = useRef<HTMLDivElement>(null);
 const [scrolled, setScrolled] = useState(false);
 useEffect(() => {
   const update = () => setScrolled(window.scrollY > 32);
   update(); window.addEventListener("scroll", update, { passive: true });
   return () => window.removeEventListener("scroll", update);
 }, []);
 const navIds = (Object.keys(pageForNav) as (keyof typeof pageForNav)[]).filter(id => data.requirements.requiredPages.includes(pageForNav[id]));
 const closeMenu = (event: MouseEvent<HTMLElement>) => { if ((event.target as HTMLElement).closest("a")) event.currentTarget.closest("details")?.removeAttribute("open"); };
 return <div className="vanguard" id="site-top" ref={root}><style data-vanguard-page-visibility>{"/* Vanguard selected pages */\n" + Object.values(pageForNav).filter(page => !data.requirements.requiredPages.includes(page)).map(page => `[data-target-page="${page}"]{display:none!important}`).join("\n")}</style><a className="vm-skip" href="#main-content">Skip to content</a><header className={`vm-header ${scrolled ? "is-scrolled" : ""}`}>
        <div className="vm-container vm-header-inner">
          <a href={withBasePath("/")} className="vm-brand" aria-label={t("common.websiteTitle")}>
            <EditableImage id="common.logoUrl" src={t("common.logoUrl")} alt="" width={36} height={36} className="vm-logo" />
            <EditableText id="common.websiteTitle">{t("common.websiteTitle")}</EditableText>
          </a>
          <nav className="vm-desktop-nav" aria-label="Main navigation">
            {navIds.map(id => <Link key={id} href={t(`common.navLinks.${id}`)} data-target-page={pageForNav[id]} aria-current={(pathname === t(`common.navLinks.${id}`) || (id === "collection" && pathname.startsWith("/cars/"))) ? "page" : undefined} data-preview-field-path={`common.navLinks.${id}`}><EditableText id={`common.navLabels.${id}`}>{t(`common.navLabels.${id}`)}</EditableText></Link>)}
          </nav>
          <div className="vm-nav-tools"><form className="vm-nav-search-inline" data-target-page="inventory" action={withBasePath("/inventory")} role="search" aria-label={t("common.searchLabel")}><label htmlFor="nav-vehicle-search" className="vm-sr-only"><EditableText id="common.searchLabel">{t("common.searchLabel")}</EditableText></label><button type="submit" aria-label={t("common.searchLabel")}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></svg></button><input id="nav-vehicle-search" type="search" name="q" placeholder={t("common.searchPlaceholder")} /></form>
          {data.requirements.requiredPages.includes("contact") && <Link data-target-page="contact" className="vm-nav-cta" href={t("common.headerCtaLink")} data-preview-field-path="common.headerCtaLink"><EditableText id="common.headerCtaLabel">{t("common.headerCtaLabel")}</EditableText><Arrow /></Link>}
          <details className="vm-mobile-menu" onKeyDown={event => { if (event.key === "Escape") { event.currentTarget.open = false; event.currentTarget.querySelector("summary")?.focus(); } }}>
            <summary aria-label="Toggle navigation"><span /><span /></summary>
            <nav aria-label="Mobile navigation" onClick={closeMenu}>
              {navIds.map(id => <Link key={id} href={t(`common.navLinks.${id}`)} data-target-page={pageForNav[id]} aria-current={(pathname === t(`common.navLinks.${id}`) || (id === "collection" && pathname.startsWith("/cars/"))) ? "page" : undefined} data-preview-field-path={`common.navLinks.${id}`}><EditableText id={`common.navLabels.${id}`}>{t(`common.navLabels.${id}`)}</EditableText><Arrow /></Link>)}
              <Link className="vm-mobile-cta" href={t("common.headerCtaLink")} data-target-page="contact" data-preview-field-path="common.headerCtaLink"><EditableText id="common.headerCtaLabel">{t("common.headerCtaLabel")}</EditableText><Arrow /></Link>
            </nav>
          </details></div>
        </div>
      </header>{children}<footer className="vm-footer"><div className="vm-container"><div className="vm-footer-main"><div className="vm-footer-brand"><a className="vm-brand" href={withBasePath("/")}><EditableImage id="common.logoUrl" src={t("common.logoUrl")} width={36} height={36} alt="" className="vm-logo" /><EditableText id="common.websiteTitle">{t("common.websiteTitle")}</EditableText></a><EditableText id="common.shortDescription" as="p" className="vm-copy">{t("common.shortDescription")}</EditableText></div><div><EditableText id="common.footerExplore" as="h2" className="vm-footer-heading">{t("common.footerExplore")}</EditableText><nav aria-label="Footer navigation">{navIds.map(id => <Link key={id} href={t(`common.navLinks.${id}`)} data-target-page={pageForNav[id]} aria-current={(pathname === t(`common.navLinks.${id}`) || (id === "collection" && pathname.startsWith("/cars/"))) ? "page" : undefined} data-preview-field-path={`common.navLinks.${id}`}><EditableText id={`common.navLabels.${id}`}>{t(`common.navLabels.${id}`)}</EditableText></Link>)}</nav></div><div><EditableText id="common.footerContact" as="h2" className="vm-footer-heading">{t("common.footerContact")}</EditableText><a href={`mailto:${t("common.business.email")}`}><EditableText id="common.business.email">{t("common.business.email")}</EditableText></a><a href={`tel:${t("common.business.phone").replace("(0)", "").replace(/[^+\d]/g, "")}`}><EditableText id="common.business.phone">{t("common.business.phone")}</EditableText></a><EditableText id="common.business.whatsapp" className="vm-empty-target">{t("common.business.whatsapp")}</EditableText></div></div><div className="vm-footer-bottom"><div><EditableText id="common.copyright" as="p">{t("common.copyright")}</EditableText><EditableText id="common.demoNotice" as="p" className="vm-demo-notice">{t("common.demoNotice")}</EditableText></div><a href="#site-top" className="vm-back-top"><EditableText id="common.backToTop">{t("common.backToTop")}</EditableText><span aria-hidden="true">↑</span></a></div></div></footer></div>;
}
