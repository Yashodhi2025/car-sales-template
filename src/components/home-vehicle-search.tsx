"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { EditableText, withBasePath } from "@deneb-ui/ui";
import { useSiteContent } from "@/lib/site-content";
import { Arrow } from "./vanguard-arrow";

type Choice = { value: string; label: string };

/** Home-specific composition: native GET selects remain available without JS. */
function SearchChoice({ name, labelPath, options, value, onChange, open, onOpen, enhanced }: {
  name: string; labelPath: string; options: Choice[]; value: string; onChange: (value: string) => void;
  open: boolean; onOpen: (open: boolean) => void; enhanced: boolean;
}) {
  const { t } = useSiteContent();
  const id = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const keyboardOpen = useRef(false);
  const [active, setActive] = useState(0);
  const selected = options.find(option => option.value === value) || options[0];
  const selectedIndex = Math.max(0, options.indexOf(selected));
  function show() { setActive(selectedIndex); onOpen(true); }
  function choose(option: Choice) { onChange(option.value); onOpen(false); trigger.current?.focus({ preventScroll: true }); }
  function keyboard(event: KeyboardEvent<HTMLButtonElement>) {
    if ((event.target as HTMLElement).isContentEditable) return;
    keyboardOpen.current = true;
    let next = active;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      next = open ? (active + (event.key === "ArrowDown" ? 1 : -1) + options.length) % options.length : selectedIndex;
      setActive(next); onOpen(true);
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault(); next = event.key === "Home" ? 0 : options.length - 1; setActive(next); onOpen(true);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault(); if (open) choose(options[active]); else show();
    } else if (event.key === "Escape") { event.preventDefault(); onOpen(false); }
    else if (event.key === "Tab") onOpen(false);
    else return;
    if (["ArrowDown","ArrowUp","Home","End"].includes(event.key)) requestAnimationFrame(() => list.current?.querySelectorAll<HTMLElement>("[role=option]")[next]?.scrollIntoView({ block: "nearest", behavior: "instant" }));
  }
  return <div data-search-field={name} className={`vm-search-choice ${value ? "has-selection" : ""} ${open ? "is-open" : ""}`}
    onPointerEnter={event => { if (enhanced && event.pointerType === "mouse" && matchMedia("(hover:hover) and (pointer:fine)").matches) { keyboardOpen.current = false; show(); } }}
    onPointerLeave={() => { if (!keyboardOpen.current && matchMedia("(hover:hover) and (pointer:fine)").matches) onOpen(false); }}
    onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) onOpen(false); }}>
    <svg className="vm-search-field-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">{name === "brand" ? <><path d="m5 10 2-5h10l2 5M3 10h18v8H3zM6 18v2m12-2v2M6 13h2m8 0h2" /></> : <><rect x="3" y="4" width="7" height="6" rx="1.5"/><rect x="14" y="4" width="7" height="6" rx="1.5"/><rect x="3" y="14" width="7" height="6" rx="1.5"/><rect x="14" y="14" width="7" height="6" rx="1.5"/></>}</svg>
    <span id={`${id}-label`} className="vm-choice-label"><EditableText id={labelPath}>{t(labelPath)}</EditableText></span>
    <select className="vm-choice-native" name={name} value={value} onChange={event => onChange(event.target.value)} aria-labelledby={`${id}-label`} hidden={enhanced}>
      {options.map(option => <option value={option.value} key={option.value}>{option.label}</option>)}
    </select>
    <button ref={trigger} type="button" className="vm-choice-trigger" role="combobox" aria-haspopup="listbox" aria-controls={`${id}-list`} aria-expanded={open}
      aria-labelledby={`${id}-label ${id}-value`} aria-activedescendant={open ? `${id}-option-${active}` : undefined} hidden={!enhanced}
      onKeyDown={keyboard} onClick={() => { keyboardOpen.current = true; if (open) onOpen(false); else show(); }}>
      <span id={`${id}-value`} className="vm-choice-value">{selected.label}</span>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
    </button>
    <div className="vm-choice-popover" hidden={!enhanced} inert={!open} aria-hidden={!open}>
      <div ref={list} id={`${id}-list`} role="listbox" aria-labelledby={`${id}-label`} className="vm-choice-list">
        {options.map((option,index) => <button id={`${id}-option-${index}`} type="button" role="option" tabIndex={-1} aria-selected={value === option.value} key={option.value}
          className={`vm-choice-option ${active === index ? "is-highlighted" : ""}`} onPointerMove={() => setActive(index)}
          onMouseDown={event => event.preventDefault()} onClick={() => choose(option)}>
          {/* The original Deneb brand/body card owns the editable label target.
              Reuse its live value here without introducing hidden duplicate targets. */}
          <span className="vm-choice-option-label">{option.label}</span>
          <svg className="vm-choice-check" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m5 12 4 4L19 6" /></svg>
        </button>)}
      </div>
    </div>
  </div>;
}

export function HomeVehicleSearch() {
  const { content, t } = useSiteContent();
  const [enhanced, setEnhanced] = useState(false);
  const [brand, setBrand] = useState("");
  const [body, setBody] = useState("");
  const [keyword, setKeyword] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    setEnhanced(true);
    const dismiss = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(null); };
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, []);
  const brands: Choice[] = [{ value: "", label: t("home.search.allBrands") }, ...Object.entries(content.cards.brands).map(([value, item]) => ({ value, label: item.displayName }))];
  const bodies: Choice[] = [{ value: "", label: t("home.search.allBodies") }, ...Object.entries(content.cards.bodyTypes).map(([value, item]) => ({ value, label: item.displayName }))];
  return <section ref={root} id="search" data-target-page="inventory" className="vm-search-section vm-search-refined vm-search-floating" aria-label={t("home.search.title")}>
    <div className="vm-container vm-search-layout">
      <div className="vm-search-panel-heading vm-sr-only"><div><EditableText id="home.search.eyebrow" as="p" className="vm-eyebrow">{t("home.search.eyebrow")}</EditableText><EditableText id="home.search.title" as="h2" className="vm-search-title" data-section-heading="search">{t("home.search.title")}</EditableText><EditableText id="home.search.description" as="p" className="vm-search-panel-description">{t("home.search.description")}</EditableText></div></div>
      <form id="vm-home-vehicle-search" className="vm-search-form vm-search-refined-form" action={withBasePath("/inventory")} method="get" role="search" aria-label={t("home.search.title")} onReset={() => { setBrand(""); setBody(""); setKeyword(""); setOpen(null); }}>
        <label className="vm-search-keyword"><svg className="vm-search-field-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></svg><span className="vm-choice-label"><EditableText id="home.search.keywordLabel">{t("home.search.keywordLabel")}</EditableText></span><span className="vm-keyword-input"><input type="search" name="q" value={keyword} onChange={event => setKeyword(event.target.value)} placeholder={t("home.search.keywordPlaceholder")} data-preview-field-path="home.search.keywordPlaceholder" onFocus={() => setOpen(null)} /></span></label>
        <SearchChoice name="brand" labelPath="home.search.brandLabel" value={brand} options={brands} onChange={setBrand} enhanced={enhanced} open={open === "brand"} onOpen={show => setOpen(current => show ? "brand" : current === "brand" ? null : current)} />
        <SearchChoice name="bodyType" labelPath="home.search.bodyLabel" value={body} options={bodies} onChange={setBody} enhanced={enhanced} open={open === "bodyType"} onOpen={show => setOpen(current => show ? "bodyType" : current === "bodyType" ? null : current)} />
        <div className="vm-search-submit"><button className="vm-button vm-button-primary" type="submit"><EditableText id="home.search.buttonLabel">{t("home.search.buttonLabel")}</EditableText><Arrow /></button><button type="reset" form="vm-home-vehicle-search" className="vm-search-reset" title={t("home.search.resetLabel")} aria-label={t("home.search.resetLabel")} disabled={enhanced && !brand && !body && !keyword}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M4 10a8 8 0 1 1 1 8M4 4v6h6" /></svg><span className="vm-sr-only"><EditableText id="home.search.resetLabel">{t("home.search.resetLabel")}</EditableText></span></button></div>
      </form>
    </div>
  </section>;
}
