"use client";

import type { ReactNode } from "react";
import { useSiteContent } from "@/lib/site-content";
import { EditableText } from "./vanguard-editable";

type BrowseProps = { href: string; className?: string; children?: ReactNode };

/** Keyed records are objects in Deneb's schema, rather than array-list items. */
export function VanguardBrandCard({ makeSlug, children, ...props }: BrowseProps & { makeSlug: string }) {
  const { t } = useSiteContent();
  return <a suppressHydrationWarning {...props} data-preview-field-path="common.navLinks.collection">
    <EditableText id={`cards.brands.${makeSlug}.displayName`}>{t(`cards.brands.${makeSlug}.displayName`)}</EditableText>
    <EditableText id={`cards.brands.${makeSlug}.countLabel`}>{t(`cards.brands.${makeSlug}.countLabel`)}</EditableText>
    {children}
  </a>;
}

export function VanguardBodyTypeCard({ typeSlug, imageSlot, children, ...props }: BrowseProps & { typeSlug: string; imageSlot?: ReactNode }) {
  const { t } = useSiteContent();
  return <a suppressHydrationWarning {...props} data-preview-field-path="common.navLinks.collection">
    {imageSlot}
    <EditableText id={`cards.bodyTypes.${typeSlug}.displayName`}>{t(`cards.bodyTypes.${typeSlug}.displayName`)}</EditableText>
    <EditableText id={`cards.bodyTypes.${typeSlug}.description`}>{t(`cards.bodyTypes.${typeSlug}.description`)}</EditableText>
    {children}
  </a>;
}

export function VanguardShowroomCard({ showroomId, className }: { showroomId: string; className?: string; children?: ReactNode }) {
  const { t } = useSiteContent();
  return <div className={className}>
    <EditableText id={`showrooms.${showroomId}.name`}>{t(`showrooms.${showroomId}.name`)}</EditableText>
    <EditableText id={`showrooms.${showroomId}.address`} as="address">{t(`showrooms.${showroomId}.address`)}</EditableText>
    <EditableText id={`showrooms.${showroomId}.notes`} as="p">{t(`showrooms.${showroomId}.notes`)}</EditableText>
  </div>;
}
