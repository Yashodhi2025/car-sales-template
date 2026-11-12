"use client";

import { useEffect } from "react";
import initialSiteData from "@/data/site-data.json";
import type { TemplateTheme } from "@deneb-ui/ui";

type RecordValue = Record<string, unknown>;
const record = (value: unknown): RecordValue => value && typeof value === "object" && !Array.isArray(value) ? value as RecordValue : {};
const baseTheme = record(record(initialSiteData.template.structure).theme);
const metadata = new Set(["designCustomizationVersion", "elementStyles", "sections"]);
const properties = new Set("display order fontFamily fontSize lineHeight fontWeight letterSpacing color backgroundColor textAlign justifyContent alignItems width height minWidth minHeight maxWidth maxHeight marginTop marginRight marginBottom marginLeft paddingTop paddingRight paddingBottom paddingLeft padding borderRadius borderWidth borderColor borderStyle boxShadow".split(" "));

// Match the bridge's safe CSS values, including valid zero-valued properties.
function cssValue(value: unknown) {
  if (typeof value === "number") return true;
  return typeof value === "string" && Boolean(value.trim()) && value.trim().length <= 160
    && !/[;{}<>\r\n]|url\s*\(|expression\s*\(|@import|javascript:/i.test(value);
}

/** The Deneb 2 bridge emits section rules, then one rule per element override. */
function scopedRuleCount(theme: RecordValue) {
  let count = 0;
  for (const [path, value] of Object.entries(record(theme.elementStyles)).slice(0, 256)) {
    if (/^[a-zA-Z0-9_.:\[\]-]{1,180}$/.test(path) && Object.entries(record(value)).some(([key, val]) => properties.has(key) && cssValue(val))) count++;
  }
  for (const [key, value] of Object.entries(record(theme.sections))) {
    if (!/^[a-zA-Z0-9_-]{1,64}$/.test(key)) continue;
    const section = record(value);
    const has = (...keys: string[]) => keys.some(name => cssValue(section[name]));
    if (section.visible === false || has("backgroundColor", "textColor", "minHeight", "padding", "contentMaxWidth", "gap", "textAlign") || ["start", "end", "center", "stretch"].includes(String(section.contentAlign))) count++;
    if (has("headingColor", "textAlign")) count++;
    if (has("textAlign")) count++;
    if (has("cardBackgroundColor", "cardWidth", "cardMinHeight", "cardRadius")) count++;
    const columns = Number(section.gridColumns);
    if (Number.isInteger(columns) && columns >= 1 && columns <= 6) count++;
    if (has("backgroundColor")) count += 4;
  }
  return count;
}

/**
 * The injected bridge enables its generic theme preset on the first element
 * edit. Its default !important rules repaint this custom template globally.
 * Retain its scoped rules unless the user actually changes site-wide settings.
 * This leaves the normal theme provider, colour replacements and all editor
 * messages intact. No editor fields or saved customisations are removed.
 */
export function PreviewStyleIsolation({ theme }: { theme?: TemplateTheme | null }) {
  useEffect(() => {
    let current = record(theme);
    const isolate = () => {
      if (Object.entries(current).some(([key, value]) => !metadata.has(key) && value !== undefined && JSON.stringify(value) !== JSON.stringify(baseTheme[key]))) return;
      const target = document.getElementById("fivora-universal-design-overrides");
      if (!(target instanceof HTMLStyleElement) || !target.sheet) return;
      const rules = Array.from(target.sheet.cssRules);
      const count = scopedRuleCount(current);
      const imports = rules.filter(rule => rule.type === CSSRule.IMPORT_RULE);
      const scoped = count ? rules.slice(-count) : [];
      const css = [...new Set([...imports, ...scoped])].map(rule => rule.cssText).join("\n");
      if (target.textContent !== css) target.textContent = css;
    };
    const onMessage = (event: MessageEvent) => {
      if (!(event.source === window.parent || (event.source === window && event.origin === location.origin))) return;
      const message = record(event.data);
      if (["FIVORA_PREVIEW_SITE_DATA", "DENEB_PREVIEW_SITE_DATA", "MARKETPLACE_PREVIEW_SITE_DATA"].includes(String(message.type))) {
        const template = record(record(message.siteData).template);
        const incoming = record(template.structure).theme ?? template.theme;
        if (incoming) current = record(incoming);
      } else if (["FIVORA_PREVIEW_STYLE_PATCH", "DENEB_PREVIEW_STYLE_PATCH"].includes(String(message.type))) {
        const path = message.fieldPath || message.targetPath;
        if (typeof path !== "string" || !path) return;
        const overrides = record(current.elementStyles);
        current = { ...current, elementStyles: { ...overrides, [path]: record(message.styles ?? message.properties) } };
      } else return;
      queueMicrotask(isolate);
    };
    // Observe only this bridge stylesheet; text edits and content rendering are
    // untouched. The observer also covers bridge insertion after React mounts.
    const observer = new MutationObserver(records => {
      if (records.some(change => (change.target instanceof Element ? change.target : change.target.parentElement)?.closest("#fivora-universal-design-overrides") || Array.from(change.addedNodes).some(node => node instanceof Element && node.id === "fivora-universal-design-overrides"))) isolate();
    });
    observer.observe(document.head, { childList: true, subtree: true, characterData: true });
    window.addEventListener("message", onMessage);
    isolate();
    return () => { observer.disconnect(); window.removeEventListener("message", onMessage); };
  }, [theme]);
  return null;
}
