"use client";

import { useEffect, useId, useState, type ComponentProps, type CSSProperties, type ElementType, type ReactNode } from "react";
import { EditableText as DenebText, EditableIcon as DenebIcon, useComponentStyle, PREVIEW_FOCUS_MESSAGE, DENEB_PREVIEW_FOCUS_MESSAGE, LEGACY_PREVIEW_FOCUS_MESSAGE } from "@deneb-ui/ui";
import { useSiteContent } from "@/lib/site-content";
import { previewPath } from "@/lib/preview-path";

/** Retain Deneb typography, including styles saved with older dotted indices. */
export function EditableText({ cssTypography = false, ...props }: ComponentProps<typeof DenebText> & { cssTypography?: boolean }) {
  const { data } = useSiteContent();
  const path = previewPath(props["data-preview-field-path"] || props.fieldPath || props.id || "");
  const legacy = path.replace(/\[(\d+)\]/g, ".$1");
  const { cssVars } = useComponentStyle(data.styles?.[path] ? path : legacy, "text");
  // Legacy record cards were styled by the site stylesheet. Roll back only
  // Deneb's inline fallbacks while keeping live editor variables authoritative.
  const defaults: CSSProperties = cssTypography ? {
    color: "var(--deneb-color, revert-layer)",
    fontSize: "var(--deneb-font-size, revert-layer)",
    fontWeight: "var(--deneb-font-weight, revert-layer)",
    lineHeight: "var(--deneb-line-height, revert-layer)",
    letterSpacing: "var(--deneb-letter-spacing, revert-layer)",
    fontFamily: "var(--deneb-font-family, revert-layer)",
    textAlign: "var(--deneb-text-align, revert-layer)" as CSSProperties["textAlign"],
    textTransform: "var(--deneb-text-transform, revert-layer)" as CSSProperties["textTransform"],
  } : {};
  return <DenebText {...props} data-preview-field-path={path} style={{ ...defaults, ...cssVars, ...props.style }} />;
}

/** Mark both link targets; Fivora owns their extra pre-hydration metadata. */
export function EditableLink({ id, targetPage, children, className = "", ...props }: ComponentProps<"a"> & { id?: string; targetPage?: string; "data-preview-field-path"?: string }) {
  const path = props["data-preview-field-path"] || id;
  const marker = path ? previewPath(path) : undefined;
  const link = <a suppressHydrationWarning {...props} className={`editable-link ${className}`} data-preview-field-path={marker}>
    {marker ? <span suppressHydrationWarning data-preview-field-path={marker}>{children}</span> : children}
  </a>;
  return targetPage ? <span data-target-page={targetPage}>{link}</span> : link;
}

export function EditableIcon({ "data-preview-field-path": marker, ...props }: ComponentProps<typeof DenebIcon> & { "data-preview-field-path"?: string }) {
  const path = marker || props.fieldPath;
  return <DenebIcon {...props} fieldPath={path ? previewPath(path) : undefined} />;
}

/** Give landmarks an editable accessible name without marking broad containers. */
export function LabelledRegion<T extends ElementType>({ as, labelPath, label, children, ...props }: { as: T; labelPath?: string; label?: string; children?: ReactNode } & Omit<ComponentProps<T>, "as" | "children">) {
  const id = useId();
  const { t } = useSiteContent();
  const Tag: ElementType = as;
  return <Tag {...props} aria-labelledby={id}>
    <span id={id} className="vm-sr-only">{labelPath ? <EditableText id={labelPath}>{t(labelPath)}</EditableText> : <span data-preview-static="Fixed accessibility landmark name">{label}</span>}</span>
    {children}
  </Tag>;
}

/** Runtime feedback stays mounted; selecting its field reveals it in the editor. */
export function EditableFeedback({ show, children, ...props }: ComponentProps<typeof DenebText> & { show: boolean }) {
  const [focused, setFocused] = useState(false);
  const path = previewPath(props.id || "");
  useEffect(() => {
    const focus = (event: MessageEvent) => {
      if (!(event.source === window.parent || (event.source === window && event.origin === location.origin))) return;
      if ([PREVIEW_FOCUS_MESSAGE, DENEB_PREVIEW_FOCUS_MESSAGE, LEGACY_PREVIEW_FOCUS_MESSAGE].includes(event.data?.type)) setFocused(previewPath(String(event.data.fieldPath || "")) === path);
    };
    window.addEventListener("message", focus);
    return () => window.removeEventListener("message", focus);
  }, [path]);
  const visible = show || focused;
  return <EditableText {...props} as={visible ? props.as : "span"} className={visible ? props.className : "vm-empty-feedback"}>{visible ? children : ""}</EditableText>;
}
