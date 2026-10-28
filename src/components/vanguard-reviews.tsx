"use client";

import { useEffect, useRef, useState } from "react";
import { DENEB_PREVIEW_FOCUS_MESSAGE, LEGACY_PREVIEW_FOCUS_MESSAGE, PREVIEW_FOCUS_MESSAGE, EditableText } from "@deneb-ui/ui";
import { useSiteContent } from "@/lib/site-content";
import { Arrow } from "./vanguard-arrow";
import { VanguardImage } from "./vanguard-image";

/** The existing Home stories, with their original source paths preserved. */
export function VanguardReviews() {
  const { content, t } = useSiteContent();
  const [review, setReview] = useState(0);
  const touch = useRef<{x:number;y:number}|null>(null);
  const focusFrame=useRef(0);
  const items=content.home.reviews;
  const active=Math.min(review,Math.max(0,items.length-1));
  function select(index:number) { setReview((index+Math.max(1,items.length))%Math.max(1,items.length)); }
  useEffect(()=>{
    const focus=(event:MessageEvent)=>{
      const trusted=event.source===window.parent || (event.source===window && event.origin===window.location.origin);
      if(!trusted || ![PREVIEW_FOCUS_MESSAGE,DENEB_PREVIEW_FOCUS_MESSAGE,LEGACY_PREVIEW_FOCUS_MESSAGE].includes(event.data?.type)) return;
      const path=String(event.data.fieldPath||"").replace(/\[(\d+)\]/g,".$1");
      const match=path.match(/^home\.reviews\.(\d+)\./);
      if(match && Number(match[1])<items.length){
        setReview(Number(match[1]));
        cancelAnimationFrame(focusFrame.current);
        // Reveal the slide before the framework resolves its editable target.
        focusFrame.current=requestAnimationFrame(()=>{
          document.querySelector(`[data-preview-field-path="${CSS.escape(path)}"]`)?.scrollIntoView({behavior:"instant",block:"center"});
        });
      }
    };
    window.addEventListener("message",focus);return()=>{window.removeEventListener("message",focus);cancelAnimationFrame(focusFrame.current);};
  },[items.length]);
  return <section id="testimonials" className="vm-testimonials-section vm-testimonials-editorial"><div className="vm-container vm-testimonials" data-reveal>
    <div className="vm-reviews-heading"><div><EditableText id="home.testimonials.eyebrow" as="p" className="vm-eyebrow">{t("home.testimonials.eyebrow")}</EditableText><EditableText id="home.testimonials.title" as="h2" className="vm-title">{t("home.testimonials.title")}</EditableText></div><div className="vm-reviews-heading-aside"><EditableText id="home.testimonials.sampleLabel" as="p" className="vm-sample-label">{t("home.testimonials.sampleLabel")}</EditableText>
    </div></div>
    <div>
      <div className="vm-review-stack" role="region" aria-roledescription="carousel" aria-label={t("home.testimonials.carouselLabel")} tabIndex={0}
        onKeyDown={event=>{if((event.target as HTMLElement).isContentEditable)return;if(event.key==="ArrowRight"||event.key==="ArrowLeft"){event.preventDefault();select(active+(event.key==="ArrowRight"?1:-1));}}}
        onPointerDown={event=>{if(event.pointerType==="touch"&&window.self===window.top)touch.current={x:event.clientX,y:event.clientY};}}
        onPointerCancel={()=>{touch.current=null;}}
        onPointerUp={event=>{if(!touch.current)return;const dx=event.clientX-touch.current.x,dy=event.clientY-touch.current.y;touch.current=null;if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)*1.3)select(active+(dx<0?1:-1));}}>
        {items.map((item,index)=><figure key={index} className={`vm-review ${index===active?"is-current":""}`} inert={index!==active} aria-hidden={index!==active} data-preview-item-path={`home.reviews.${index}`}>
          <div className="vm-review-top vm-review-media"><VanguardImage id={`home.reviews.${index}.image`} src={item.image} alt={item.imageAlt} width={1000} height={900} loading="lazy" /></div>
          <div className="vm-review-composition"><div className="vm-review-strap"><span className="vm-quote-mark" aria-hidden="true">“</span><EditableText id="home.testimonials.cardLabel" as="p" className="vm-review-demo">{t("home.testimonials.cardLabel")}</EditableText></div>
          <EditableText id={`home.reviews.${index}.quote`} as="blockquote">{item.quote}</EditableText>
          <div className="vm-review-author"><EditableText id={`home.reviews.${index}.initials`} className="vm-avatar">{item.initials}</EditableText><div><EditableText id={`home.reviews.${index}.name`} as="p" className="vm-review-name">{item.name}</EditableText><EditableText id={`home.reviews.${index}.detail`} as="p" className="vm-review-detail">{item.detail}</EditableText></div></div>
          </div>
        </figure>)}
      </div>
      <div className="vm-review-navigation"><div className="vm-slider-controls"><button type="button" className="vm-icon-button" disabled={items.length<2} aria-label={t("home.testimonials.previousLabel")} onClick={()=>select(active-1)}><Arrow back /></button><span aria-live="polite" aria-atomic="true"><EditableText id="home.testimonials.counterLabel">{t("home.testimonials.counterLabel")}</EditableText> {String(items.length?active+1:0).padStart(2,"0")}<span className="vm-slider-total"> / {String(items.length).padStart(2,"0")}</span></span><button type="button" className="vm-icon-button" disabled={items.length<2} aria-label={t("home.testimonials.nextLabel")} onClick={()=>select(active+1)}><Arrow /></button></div><div className="vm-story-dots">{items.map((item,index)=><button key={index} type="button" aria-pressed={index===active} aria-label={`${t("home.testimonials.storyLabel")} ${index+1}: ${item.name}`} onClick={()=>select(index)}><span /></button>)}</div></div>
    </div>
  </div></section>;
}
