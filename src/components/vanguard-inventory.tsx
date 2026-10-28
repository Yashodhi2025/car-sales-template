"use client";

import { useEffect, useLayoutEffect, useRef, useState, type FormEvent } from "react";
import { DENEB_PREVIEW_FOCUS_MESSAGE, LEGACY_PREVIEW_FOCUS_MESSAGE, PREVIEW_FOCUS_MESSAGE, EditableLink, EditableText, withBasePath } from "@deneb-ui/ui";
import { VanguardImage } from "./vanguard-image";
import { useSiteContent, type VehicleId } from "@/lib/site-content";
import { defaultFilters, filterQuery, invalidPrices, matchingVehicles, parseFilters, type InventoryFilters } from "@/lib/inventory";
import { Arrow } from "./vanguard-arrow";
import { VehicleListing } from "./vehicle-listing";
import { usePageEffects } from "./use-page-effects";

const sortLabels = {
  featured: "sortFeatured", "price-low": "sortPriceLow", "price-high": "sortPriceHigh",
  newest: "sortNewest", oldest: "sortOldest", mileage: "sortMileage",
};

export function VanguardInventory() {
  const { data, content, t } = useSiteContent();
  const root = useRef<HTMLElement>(null);
  const panel = useRef<HTMLDetailsElement>(null);
  const sidebar = useRef<HTMLElement>(null);
  const filterToggle = useRef<HTMLButtonElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [desktop, setDesktop] = useState(false);
  const previousLayout = useRef<Map<HTMLElement, DOMRect> | null>(null);
  const layoutAnimations = useRef<Animation[]>([]);
  const filterAnimations = useRef<Animation[]>([]);
  const [filters, setFilters] = useState<InventoryFilters>({ ...defaultFilters });
  usePageEffects(root);

  useEffect(() => {
    // Read URL state after hydration so the static HTML contains the full stock.
    // This avoids making the export dependent on request-time search parameters.
    const restore = () => setFilters(parseFilters(window.location.search));
    restore();
    window.addEventListener("popstate", restore);
    const desktopQuery = window.matchMedia("(min-width: 901px)");
    const sizePanel = () => {
      setDesktop(desktopQuery.matches);
      if (panel.current) panel.current.open = desktopQuery.matches;
    };
    sizePanel();
    desktopQuery.addEventListener("change", sizePanel);
    return () => {
      window.removeEventListener("popstate", restore);
      desktopQuery.removeEventListener("change", sizePanel);
    };
  }, []);

  useEffect(() => {
    // A collapsed sidebar must not prevent the editor selecting its source fields.
    const focus = (event: MessageEvent) => {
      if (!(event.source === window.parent || (event.source === window && event.origin === location.origin)) || ![PREVIEW_FOCUS_MESSAGE,DENEB_PREVIEW_FOCUS_MESSAGE,LEGACY_PREVIEW_FOCUS_MESSAGE].includes(event.data?.type)) return;
      const path = String(event.data.fieldPath || "");
      if (path === "inventory.filters.showLabel") { setSidebarOpen(false); return; }
      if (path.startsWith("inventory.filters.") || path === "inventory.hero.demoNote") {
        setSidebarOpen(true);
        if (panel.current) panel.current.open = true;
      }
    };
    window.addEventListener("message",focus);
    return () => window.removeEventListener("message",focus);
  }, []);

  useLayoutEffect(() => {
    const previous = previousLayout.current;
    previousLayout.current = null;
    if (!previous) return;
    // FLIP the existing mounted cards into their new rows; no animation library
    // or image reload is needed when the responsive column count changes.
    const animations: Animation[] = [];
    for (const [node, before] of previous) {
      const after = node.getBoundingClientRect();
      if (!after.width || !after.height) continue;
      const resize = node.matches(".vm-vehicle-wrap,.vm-empty-results");
      animations.push(node.animate([
        { transform: `translate(${before.left-after.left}px,${before.top-after.top}px)${resize ? ` scale(${before.width/after.width},${before.height/after.height})` : ""}`, transformOrigin: "top left" },
        { transform: "none", transformOrigin: "top left" },
      ], { duration: 420, easing: "cubic-bezier(.22,1,.36,1)" }));
    }
    layoutAnimations.current = animations;
    return () => animations.forEach(animation => animation.cancel());
  }, [sidebarOpen]);

  useEffect(() => {
    layoutAnimations.current.forEach(animation => animation.cancel());
    if (!content.motion.enabled || window.self !== window.top || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const animations = [...root.current?.querySelectorAll<HTMLElement>(".vm-vehicle-wrap:not([hidden])") || []]
      .map((node, index) => node.animate(
        [{ opacity: 0.55, transform: "translateY(14px)" }, { opacity: 1, transform: "translateY(0)" }],
        { duration: 420, delay: Math.min(index * 35, 175), easing: "cubic-bezier(.16,1,.3,1)" },
      ));
    filterAnimations.current = animations;
    return () => animations.forEach(animation => animation.cancel());
  }, [filters, content.motion.enabled]);

  const ids = Object.keys(content.cards.vehicles) as VehicleId[];
  const matching = matchingVehicles(content, filters);
  const visible = new Set(matching);
  // Reorder matching cards but keep every source-backed target mounted.
  const ordered = [...matching, ...ids.filter(id => !visible.has(id))];
  const priceError = invalidPrices(filters);
  const activeKeys = (Object.keys(filters) as (keyof InventoryFilters)[])
    .filter(key => key !== "sort" && filters[key] !== "");
  const unique = (field: "fuel" | "transmission" | "availability") =>
    [...new Set(ids.map(id => String(content.cards.vehicles[id][field] ?? "")).filter(Boolean))].sort();
  const brands = Object.entries(content.cards.brands).map(([value, card]) => ({ value, label: card.displayName }));
  const bodies = Object.entries(content.cards.bodyTypes).map(([value, card]) => ({ value, label: card.displayName }));

  function update(next: InventoryFilters) {
    setFilters(next);
    const query = filterQuery(next);
    window.history.replaceState(null, "", `${window.location.pathname}${query ? `?${query}` : ""}`);
  }
  function change(key: keyof InventoryFilters, value: string) {
    update({ ...filters, [key]: value });
  }
  function toggleSidebar() {
    const animate = desktop && content.motion.enabled && window.self === window.top && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    previousLayout.current = animate ? new Map(
      [...root.current?.querySelectorAll<HTMLElement>(".vm-inventory-grid > .vm-vehicle-wrap:not([hidden]),.vm-inventory-toolbar > div,.vm-active-filters:not([hidden]),.vm-empty-results:not([hidden])") || []]
        .map(node => [node, node.getBoundingClientRect()]),
    ) : null;
    // Capture the current visual position first so rapid repeated toggles stay smooth.
    layoutAnimations.current.forEach(animation => animation.cancel());
    filterAnimations.current.forEach(animation => animation.cancel());
    if (sidebarOpen && sidebar.current?.contains(document.activeElement)) filterToggle.current?.focus({ preventScroll: true });
    setSidebarOpen(current => !current);
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (priceError) return;
    if (window.matchMedia("(max-width: 900px)").matches && panel.current) panel.current.open = false;
    document.getElementById("inventory-results")?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  }
  function select(key: keyof InventoryFilters, label: string, empty: string, options: { value: string; label: string }[]) {
    return (
      <label className="vm-inventory-field" data-filter-key={key}>
        <EditableText id={`inventory.filters.${label}`}>{t(`inventory.filters.${label}`)}</EditableText>
        <div className="vm-filter-select"><select name={key} className={filters[key] ? "has-value" : ""} value={filters[key]} onChange={event => change(key, event.target.value)}>
          <option value="">{t(`inventory.filters.${empty}`)}</option>
          {options.map(option => <option value={option.value} key={option.value}>{option.label}</option>)}
        </select><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg></div>
      </label>
    );
  }
  const chipLabel = (key: keyof InventoryFilters) => {
    if (key === "brand") return brands.find(brand => brand.value === filters.brand)?.label || filters.brand;
    if (key === "bodyType") return bodies.find(body => body.value === filters.bodyType)?.label || filters.bodyType;
    if (key === "minPrice") return `${t("inventory.filters.minLabel")} ${t("common.currencyCode")} ${Number(filters.minPrice).toLocaleString("en-LK")}`;
    if (key === "maxPrice") return `${t("inventory.filters.maxLabel")} ${t("common.currencyCode")} ${Number(filters.maxPrice).toLocaleString("en-LK")}`;
    return filters[key];
  };
  if (!data.requirements.requiredPages.includes("inventory")) return null;

  return (
    <main id="main-content" ref={root} className="vm-page vm-inventory-page" data-preview-page-key="inventory">
      <header className="vm-container vm-inventory-hero">
        <div className="vm-inventory-intro">
          <nav className="vm-breadcrumb" aria-label="Breadcrumb">
            <EditableLink href={withBasePath("/")} targetPage="home"><EditableText id="common.navLabels.home">{t("common.navLabels.home")}</EditableText></EditableLink>
            <span aria-hidden="true">/</span><EditableText id="common.navLabels.collection">{t("common.navLabels.collection")}</EditableText>
          </nav>
          <EditableText id="inventory.hero.eyebrow" as="p" className="vm-eyebrow vm-hero-enter">{t("inventory.hero.eyebrow")}</EditableText>
          <EditableText id="inventory.hero.title" as="h1" className="vm-title vm-inventory-title vm-hero-enter">{t("inventory.hero.title")}</EditableText>
          <EditableText id="inventory.hero.description" as="p" className="vm-copy vm-hero-enter">{t("inventory.hero.description")}</EditableText>
        </div>
        <figure className="vm-inventory-cover">
          <VanguardImage id="inventory.hero.image" src={t("inventory.hero.image")} alt={t("inventory.hero.imageAlt")}
            width={1100} height={750} loading="eager" fetchPriority="high" />
          <figcaption><span aria-hidden="true">{String(ids.length).padStart(2, "0")}</span><EditableText id="inventory.hero.imageCaption">{t("inventory.hero.imageCaption")}</EditableText></figcaption>
        </figure>
      </header>

      <div className={`vm-container vm-inventory-layout ${sidebarOpen ? "is-filters-open" : "is-filters-collapsed"}`}>
        <aside id="inventory-filters" ref={sidebar} className="vm-inventory-sidebar" inert={desktop && !sidebarOpen} aria-hidden={desktop && !sidebarOpen}
          onKeyDown={event => {
            if ((event.target as HTMLElement).isContentEditable) return;
            if (event.key !== "Escape") return;
            if (desktop && sidebarOpen) { event.preventDefault(); toggleSidebar(); }
            else if (!desktop && panel.current?.open) { panel.current.open = false; panel.current.querySelector("summary")?.focus(); }
          }}><div className="vm-inventory-sidebar-inner">
          <details className="vm-filter-panel" ref={panel} open>
            <summary><EditableText id="inventory.filters.mobileLabel">{t("inventory.filters.mobileLabel")}</EditableText><span>{activeKeys.length ? `(${activeKeys.length})` : "+"}</span></summary>
            <form className="vm-filter-form" onSubmit={submit} noValidate role="search" aria-label={t("inventory.filters.title")}>
              <div className="vm-filter-heading"><div><EditableText id="inventory.filters.title" as="h2">{t("inventory.filters.title")}</EditableText><EditableText id="inventory.filters.description" as="p">{t("inventory.filters.description")}</EditableText></div><button type="button" className="vm-sidebar-close" onClick={toggleSidebar} aria-label={t("inventory.filters.hideLabel")}><Arrow back /></button></div>
              <div className="vm-filter-section vm-filter-primary"><label className="vm-inventory-field" data-filter-key="q">
                <EditableText id="inventory.filters.searchLabel">{t("inventory.filters.searchLabel")}</EditableText>
                <div className="vm-filter-search-control"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></svg><input type="search" name="q" className={filters.q ? "has-value" : ""} value={filters.q} maxLength={200} onChange={event => change("q", event.target.value)}
                  placeholder={t("inventory.filters.searchPlaceholder")} data-preview-field-path="inventory.filters.searchPlaceholder" /></div>
              </label>
              {select("brand", "brandLabel", "anyBrand", brands)}
              {select("bodyType", "bodyLabel", "anyBody", bodies)}</div>
              <fieldset className="vm-price-range">
                <legend><EditableText id="inventory.filters.priceLabel">{t("inventory.filters.priceLabel")}</EditableText></legend>
                <div>
                  {(["minPrice", "maxPrice"] as const).map((key, index) => (
                    <label key={key} className="vm-inventory-field">
                      <EditableText id={`inventory.filters.${index === 0 ? "minLabel" : "maxLabel"}`}>{t(`inventory.filters.${index === 0 ? "minLabel" : "maxLabel"}`)}</EditableText>
                      <input type="number" min="0" step="1" inputMode="numeric" name={key} className={filters[key] ? "has-value" : ""} value={filters[key]}
                        onChange={event => change(key, event.target.value)} aria-invalid={priceError} aria-describedby={priceError ? "inventory-price-error" : undefined}
                        placeholder={t(`inventory.filters.${index === 0 ? "minPlaceholder" : "maxPlaceholder"}`)} />
                    </label>
                  ))}
                </div>
                <p id="inventory-price-error" className="vm-price-error" hidden={!priceError} role="status"><EditableText id="inventory.filters.invalidPrice">{t("inventory.filters.invalidPrice")}</EditableText></p>
              </fieldset>
              <div className="vm-filter-section vm-filter-details">{select("fuel", "fuelLabel", "anyFuel", unique("fuel").map(value => ({ value, label: value })))}
              {select("transmission", "transmissionLabel", "anyTransmission", unique("transmission").map(value => ({ value, label: value })))}
              {select("availability", "availabilityLabel", "anyAvailability", unique("availability").map(value => ({ value, label: value === "Available" ? t("inventory.filters.availableLabel") : value === "Reserved" ? t("inventory.filters.reservedLabel") : value })))} </div>
              <div className="vm-filter-footer"><button type="submit" className="vm-button vm-button-primary vm-filter-apply"><EditableText id="inventory.filters.applyLabel">{t("inventory.filters.applyLabel")}</EditableText><Arrow /></button>
              <button type="button" className="vm-inventory-reset" onClick={() => update({ ...defaultFilters })}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M4 10a8 8 0 1 1 1 8M4 4v6h6" /></svg><EditableText id="inventory.filters.resetLabel">{t("inventory.filters.resetLabel")}</EditableText></button></div>
            </form>
          </details>
          <EditableText id="inventory.hero.demoNote" as="p" className="vm-inventory-demo">{t("inventory.hero.demoNote")}</EditableText>
        </div></aside>

        <section id="inventory-results" className="vm-inventory-results" aria-label={t("inventory.results.title")}>
          <div className="vm-inventory-toolbar">
            <div><EditableText id="inventory.results.title" as="h2" className="vm-inventory-results-title">{t("inventory.results.title")}</EditableText><p role="status" aria-live="polite" aria-atomic="true" className="vm-inventory-count"><strong>{matching.length}</strong> <EditableText id="inventory.results.countLabel">{t("inventory.results.countLabel")}</EditableText><span aria-hidden="true"> / </span>{ids.length} <EditableText id="inventory.results.totalLabel">{t("inventory.results.totalLabel")}</EditableText></p></div>
            <div className="vm-inventory-toolbar-actions"><button ref={filterToggle} type="button" className="vm-filter-toggle" aria-expanded={sidebarOpen} aria-controls="inventory-filters" aria-label={t(sidebarOpen ? "inventory.filters.hideLabel" : "inventory.filters.showLabel")} title={t(sidebarOpen ? "inventory.filters.hideLabel" : "inventory.filters.showLabel")} onClick={toggleSidebar}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M4 7h4m4 0h8M4 17h8m4 0h4"/><circle cx="10" cy="7" r="2"/><circle cx="14" cy="17" r="2"/></svg>
              <EditableText id="inventory.filters.toggleLabel">{t("inventory.filters.toggleLabel")}</EditableText><span className="vm-sr-only"><EditableText id="inventory.filters.hideLabel" hidden={!sidebarOpen}>{t("inventory.filters.hideLabel")}</EditableText><EditableText id="inventory.filters.showLabel" hidden={sidebarOpen}>{t("inventory.filters.showLabel")}</EditableText></span><span className="vm-filter-toggle-count" hidden={!activeKeys.length} aria-hidden="true">{activeKeys.length}</span>
            </button><label className="vm-sort-field"><EditableText id="inventory.results.sortLabel">{t("inventory.results.sortLabel")}</EditableText><select name="sort" value={filters.sort} onChange={event => change("sort", event.target.value)}>{Object.entries(sortLabels).map(([value, label]) => <option key={value} value={value}>{t(`inventory.results.${label}`)}</option>)}</select><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg></label></div>
          </div>
          <div className="vm-active-filters" hidden={!activeKeys.length}>
            <EditableText id="inventory.filters.activeLabel" className="vm-active-filter-label">{t("inventory.filters.activeLabel")}</EditableText>
            {activeKeys.map(key => <button key={key} type="button" onClick={() => change(key, "")}
              aria-label={`${t("inventory.filters.removeLabel")}: ${chipLabel(key)}`}>{chipLabel(key)}<span aria-hidden="true">×</span></button>)}
          </div>
          <noscript><p className="vm-no-script">{t("inventory.results.noScript")}</p></noscript>
          <div className="vm-vehicle-grid vm-inventory-grid">
            {ordered.map((id, index) => <div key={id} hidden={!visible.has(id)} className="vm-vehicle-wrap"><VehicleListing id={id} index={index} /></div>)}
          </div>
          <div className="vm-empty-results" hidden={matching.length > 0}>
            <span className="vm-empty-mark" aria-hidden="true">↗</span>
            <EditableText id="home.collection.emptyTitle" as="h3">{t("home.collection.emptyTitle")}</EditableText>
            <EditableText id="home.collection.emptyDescription" as="p">{t("home.collection.emptyDescription")}</EditableText>
            <button type="button" className="vm-button vm-button-outline" onClick={() => update({ ...defaultFilters })}><EditableText id="inventory.filters.resetLabel">{t("inventory.filters.resetLabel")}</EditableText><Arrow /></button>
          </div>
        </section>
      </div>

      <section className="vm-container vm-inventory-concierge" data-reveal>
        <div><EditableText id="inventory.concierge.eyebrow" as="p" className="vm-eyebrow">{t("inventory.concierge.eyebrow")}</EditableText><EditableText id="inventory.concierge.title" as="h2" className="vm-title">{t("inventory.concierge.title")}</EditableText><EditableText id="inventory.concierge.description" as="p" className="vm-copy">{t("inventory.concierge.description")}</EditableText></div>
        <EditableLink href={withBasePath(t("inventory.concierge.buttonLink"))} data-preview-field-path="inventory.concierge.buttonLink" targetPage="contact" className="vm-button vm-button-outline"><EditableText id="inventory.concierge.buttonLabel">{t("inventory.concierge.buttonLabel")}</EditableText><Arrow /></EditableLink>
      </section>
    </main>
  );
}
