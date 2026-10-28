"use client";

import { useEffect, useRef } from "react";
import { DENEB_PREVIEW_FOCUS_MESSAGE, LEGACY_PREVIEW_FOCUS_MESSAGE, PREVIEW_FOCUS_MESSAGE, EditableLink, EditableText, withBasePath } from "@deneb-ui/ui";
import { useSiteContent } from "@/lib/site-content";
import { Arrow } from "./vanguard-arrow";

/** Native disclosure keeps answers and keyboard behavior available without JS. */
export function VanguardFaq() {
  const { content, t } = useSiteContent();
  const list=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const focus=(event:MessageEvent)=>{
      if(event.source!==window.parent||![PREVIEW_FOCUS_MESSAGE,DENEB_PREVIEW_FOCUS_MESSAGE,LEGACY_PREVIEW_FOCUS_MESSAGE].includes(event.data?.type))return;
      const match=String(event.data.fieldPath||"").replace(/\[(\d+)\]/g,".$1").match(/^faq\.items\.(\d+)\./);
      if(match){const item=list.current?.querySelectorAll("details")[Number(match[1])];if(item)item.open=true;}
    };
    window.addEventListener("message",focus);return()=>window.removeEventListener("message",focus);
  },[]);
  return <section id="faq" className="vm-faq-section"><div className="vm-container vm-faq-layout">
    <div data-reveal><EditableText id="faq.eyebrow" as="p" className="vm-eyebrow">{t("faq.eyebrow")}</EditableText><EditableText id="faq.title" as="h2" className="vm-title">{t("faq.title")}</EditableText><EditableText id="faq.description" as="p" className="vm-copy">{t("faq.description")}</EditableText><EditableLink href={withBasePath(t("faq.buttonLink"))} data-preview-field-path="faq.buttonLink" className="vm-text-link"><EditableText id="faq.buttonLabel">{t("faq.buttonLabel")}</EditableText><Arrow /></EditableLink></div>
    <div ref={list} className="vm-faq-list">{content.faq.items.map((item,index)=><details key={index} className="vm-faq-item" data-preview-item-path={`faq.items.${index}`} open={index===0}>
      <summary><span className="vm-faq-number" aria-hidden="true">{String(index+1).padStart(2,"0")}</span><EditableText id={`faq.items.${index}.question`}>{t(`faq.items.${index}.question`)}</EditableText><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M5 12h14" /><path className="vm-faq-plus" d="M12 5v14" /></svg></summary>
      <div className="vm-faq-answer"><EditableText id={`faq.items.${index}.answer`} as="p">{t(`faq.items.${index}.answer`)}</EditableText></div>
    </details>)}</div>
  </div></section>;
}
