"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { EditableLink, EditableText, withBasePath } from "@deneb-ui/ui";
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
  const [filters, setFilters] = useState<InventoryFilters>({ ...defaultFilters });
  usePageEffects(root);

  useEffect(() => {
    // Read URL state after hydration so the static HTML contains the full stock.
    // This avoids making the export dependent on request-time search parameters.
    const restore = () => setFilters(parseFilters(window.location.search));
    restore();
    window.addEventListener("popstate", restore);
    const desktop = window.matchMedia("(min-width: 901px)");
    const sizePanel = () => { if (panel.current) panel.current.open = desktop.matches; };
    sizePanel();
    desktop.addEventListener("change", sizePanel);
    return () => {
      window.removeEventListener("popstate", restore);
      desktop.removeEventListener("change", sizePanel);
    };
  }, []);

  useEffect(() => {
    if (window.self !== window.top || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const animations = [...root.current?.querySelectorAll<HTMLElement>(".vm-vehicle-wrap:not([hidden])") || []]
      .map((node, index) => node.animate(
        [{ opacity: 0.55, transform: "translateY(14px)" }, { opacity: 1, transform: "translateY(0)" }],
        { duration: 420, delay: Math.min(index * 35, 175), easing: "cubic-bezier(.16,1,.3,1)" },
      ));
    return () => animations.forEach(animation => animation.cancel());
  }, [filters]);

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
      <label className="vm-inventory-field">
        <EditableText id={`inventory.filters.${label}`}>{t(`inventory.filters.${label}`)}</EditableText>
        <select name={key} value={filters[key]} onChange={event => change(key, event.target.value)}>
          <option value="">{t(`inventory.filters.${empty}`)}</option>
          {options.map(option => <option value={option.value} key={option.value}>{option.label}</option>)}
        </select>
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

      <div className="vm-container vm-inventory-layout">
        <aside className="vm-inventory-sidebar">
          <details className="vm-filter-panel" ref={panel} open>
            <summary><EditableText id="inventory.filters.mobileLabel">{t("inventory.filters.mobileLabel")}</EditableText><span>{activeKeys.length ? `(${activeKeys.length})` : "+"}</span></summary>
            <form onSubmit={submit} noValidate role="search" aria-label={t("inventory.filters.title")}>
              <div className="vm-filter-heading"><EditableText id="inventory.filters.title" as="h2">{t("inventory.filters.title")}</EditableText><EditableText id="inventory.filters.description" as="p">{t("inventory.filters.description")}</EditableText></div>
              <label className="vm-inventory-field">
                <EditableText id="inventory.filters.searchLabel">{t("inventory.filters.searchLabel")}</EditableText>
                <input type="search" name="q" value={filters.q} maxLength={200} onChange={event => change("q", event.target.value)}
                  placeholder={t("inventory.filters.searchPlaceholder")} data-preview-field-path="inventory.filters.searchPlaceholder" />
              </label>
              {select("brand", "brandLabel", "anyBrand", brands)}
              {select("bodyType", "bodyLabel", "anyBody", bodies)}
              <fieldset className="vm-price-range">
                <legend><EditableText id="inventory.filters.priceLabel">{t("inventory.filters.priceLabel")}</EditableText></legend>
                <div>
                  {(["minPrice", "maxPrice"] as const).map((key, index) => (
                    <label key={key} className="vm-inventory-field">
                      <EditableText id={`inventory.filters.${index === 0 ? "minLabel" : "maxLabel"}`}>{t(`inventory.filters.${index === 0 ? "minLabel" : "maxLabel"}`)}</EditableText>
                      <input type="number" min="0" step="1" inputMode="numeric" name={key} value={filters[key]}
                        onChange={event => change(key, event.target.value)} aria-invalid={priceError} aria-describedby={priceError ? "inventory-price-error" : undefined}
                        placeholder={t(`inventory.filters.${index === 0 ? "minPlaceholder" : "maxPlaceholder"}`)} />
                    </label>
                  ))}
                </div>
                <p id="inventory-price-error" className="vm-price-error" hidden={!priceError} role="status"><EditableText id="inventory.filters.invalidPrice">{t("inventory.filters.invalidPrice")}</EditableText></p>
              </fieldset>
              {select("fuel", "fuelLabel", "anyFuel", unique("fuel").map(value => ({ value, label: value })))}
              {select("transmission", "transmissionLabel", "anyTransmission", unique("transmission").map(value => ({ value, label: value })))}
              {select("availability", "availabilityLabel", "anyAvailability", unique("availability").map(value => ({ value, label: value === "Available" ? t("inventory.filters.availableLabel") : value === "Reserved" ? t("inventory.filters.reservedLabel") : value })))}
              <button type="submit" className="vm-button vm-button-primary vm-filter-apply"><EditableText id="inventory.filters.applyLabel">{t("inventory.filters.applyLabel")}</EditableText><Arrow /></button>
              <button type="button" className="vm-inventory-reset" onClick={() => update({ ...defaultFilters })}><span aria-hidden="true">↺</span><EditableText id="inventory.filters.resetLabel">{t("inventory.filters.resetLabel")}</EditableText></button>
            </form>
          </details>
          <EditableText id="inventory.hero.demoNote" as="p" className="vm-inventory-demo">{t("inventory.hero.demoNote")}</EditableText>
        </aside>

        <section id="inventory-results" className="vm-inventory-results" aria-label={t("inventory.results.title")}>
          <div className="vm-inventory-toolbar">
            <div><EditableText id="inventory.results.title" as="h2" className="vm-inventory-results-title">{t("inventory.results.title")}</EditableText><p role="status" aria-live="polite" aria-atomic="true" className="vm-inventory-count"><strong>{matching.length}</strong> <EditableText id="inventory.results.countLabel">{t("inventory.results.countLabel")}</EditableText><span aria-hidden="true"> / </span>{ids.length} <EditableText id="inventory.results.totalLabel">{t("inventory.results.totalLabel")}</EditableText></p></div>
            <label className="vm-sort-field"><EditableText id="inventory.results.sortLabel">{t("inventory.results.sortLabel")}</EditableText><select name="sort" value={filters.sort} onChange={event => change("sort", event.target.value)}>{Object.entries(sortLabels).map(([value, label]) => <option key={value} value={value}>{t(`inventory.results.${label}`)}</option>)}</select></label>
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
