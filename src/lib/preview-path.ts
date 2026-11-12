import initialSiteData from "@/data/site-data.json";

/** Deneb uses bracket indices for arrays and dotted keys for keyed objects. */
export function previewPath(path: string) {
  let value: unknown = initialSiteData.content;
  let result = "";
  for (const key of path.replace(/\[(\d+)\]/g, ".$1").split(".")) {
    const list = Array.isArray(value);
    result += list && /^\d+$/.test(key) ? `[${key}]` : `${result ? "." : ""}${key}`;
    value = Array.isArray(value) ? value[Number(key)] ?? value[0] : value && typeof value === "object" ? (value as Record<string, unknown>)[key] : undefined;
  }
  return result;
}

export function previewField(path: string) {
  // Fivora adds and rebuilds resolved-path metadata before hydration. Tolerate
  // those editor-owned attributes only on the actual editable DOM targets.
  return { "data-preview-field-path": previewPath(path), suppressHydrationWarning: true };
}

export function previewList(path: string) {
  return { "data-preview-list-path": previewPath(path), suppressHydrationWarning: true };
}
