"use client";

import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { createPortal } from "react-dom";
import { EditableDialog, EditableText, withBasePath } from "@deneb-ui/ui";
import { VanguardImage } from "./vanguard-image";
import { useSiteContent, type VehicleId } from "@/lib/site-content";
import { vehiclePhotos } from "@/lib/vehicles";
import { Arrow } from "./vanguard-arrow";
import { useVehiclePhotoFocus } from "./use-vehicle-photo-focus";
import { VehicleImageExplorer } from "./vehicle-image-explorer";

/** Vanguard-only gallery composition; editable UI remains the installed Deneb UI. */
export function VehicleGallery({ vehicleId }: { vehicleId: VehicleId }) {
  const { content, t } = useSiteContent();
  const curveClipId = `vehicle-gallery-curve-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const photos = vehiclePhotos(content, vehicleId);
  const [selected, setSelected] = useState(0);
  const [previous, setPrevious] = useState<number | null>(null);
  const [direction, setDirection] = useState(1);
  const [fit, setFit] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const active = Math.min(selected, photos.length - 1);
  const imageRefs = useRef<(HTMLImageElement | null)[]>([]);
  const viewer = useRef<HTMLDivElement>(null);
  const thumbnails = useRef<HTMLDivElement>(null);
  const panels = useRef<HTMLDivElement>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const dragged = useRef(false);
  const request = useRef(0);
  const focusPhoto = useCallback((index: number) => { request.current++; setPrevious(null); setSelected(index); }, []);
  useVehiclePhotoFocus(vehicleId, photos.length, focusPhoto);

  function select(index: number) {
    const next = (index + photos.length) % photos.length;
    const ticket = ++request.current;
    if (next === active) return;
    const commit = () => { setPrevious(active); setDirection(index > active ? 1 : -1); setSelected(next); };
    const image = imageRefs.current[next];
    if (image) image.loading = "eager";
    if (!image || image.complete) { commit(); return; }
    // Preserve the visible image while a lazy photo decodes; cancel stale clicks.
    void image.decode().catch(() => undefined).then(() => { if (request.current === ticket) commit(); });
  }
  function pointerDown(event: PointerEvent<HTMLDivElement>) {
    if (window.self !== window.top || event.button !== 0 || (event.target as HTMLElement).closest("button:not(.vm-gallery-panel-open),a,[contenteditable='true']")) return;
    dragged.current = false;
    touch.current = { x: event.clientX, y: event.clientY };
    const capture = (event.target as HTMLElement).closest<HTMLElement>(".vm-gallery-panel-open") || event.currentTarget;
    capture.setPointerCapture(event.pointerId);
  }
  function pointerUp(event: PointerEvent<HTMLDivElement>) {
    if (!touch.current) return;
    const dx = event.clientX - touch.current.x, dy = event.clientY - touch.current.y;
    touch.current = null;
    dragged.current = event.currentTarget.classList.contains("vm-gallery-stage") && (Math.abs(dx) > 10 || Math.abs(dy) > 10);
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.3) select(active + (dx < 0 ? 1 : -1));
  }
  const pointerEvents = { onPointerDown: pointerDown, onPointerUp: pointerUp, onPointerCancel: () => { touch.current = null; dragged.current = false; } };
  const slideClass = (index: number) => `vm-gallery-slide ${index === active ? "is-active" : index === previous ? "is-leaving" : ""}`;
  function openPhoto(index: number) {
    if (window.self !== window.top) return;
    dragged.current = false;
    focusPhoto(index);
    setExpanded(true);
  }
  function keyboard(event: KeyboardEvent<HTMLElement>) {
    const target = event.target as HTMLElement;
    if (target.isContentEditable || target.closest("input,textarea,select")) return;
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault(); event.stopPropagation();
      const next = active + (event.key === "ArrowRight" ? 1 : -1);
      select(next);
      if (target.closest(".vm-gallery-panel-open")) {
        panels.current?.children[(next + photos.length) % photos.length]?.querySelector<HTMLButtonElement>(".vm-gallery-panel-open")?.focus({ preventScroll: true });
      }
    }
  }
  useEffect(() => {
    for (const rail of [thumbnails.current, panels.current]) {
      const item = rail?.children[active] as HTMLElement | undefined;
      if (!rail || !item) continue;
      const left = item.getBoundingClientRect().left - rail.getBoundingClientRect().left + rail.scrollLeft;
      if (left < rail.scrollLeft || left + item.offsetWidth > rail.scrollLeft + rail.clientWidth) {
        rail.scrollTo({ left: Math.max(0, left - 12), behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches || !content.motion.enabled || window.self !== window.top ? "instant" : "smooth" });
      }
    }
  }, [active, content.motion.enabled]);
  useEffect(() => {
    if (!expanded) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const background = document.getElementById("site-top");
    const wasInert = background?.inert || false;
    if (background) background.inert = true;
    const frame = requestAnimationFrame(() => viewer.current?.querySelector<HTMLButtonElement>(".vm-viewer-close")?.focus());
    const trap = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const controls = [...viewer.current?.querySelectorAll<HTMLElement>("button:not([disabled]),a[href],[tabindex='0']") || []];
      const first = controls[0], last = controls.at(-1);
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", trap);
    return () => {
      cancelAnimationFrame(frame); document.removeEventListener("keydown", trap);
      if (background) background.inert = wasInert;
      if (previous?.isConnected) previous.focus({ preventScroll: true });
    };
  }, [expanded]);

  return (
    <section className="vm-car-gallery vm-gallery-cinematic vm-curved-gallery" data-photo-count={photos.length} aria-label={t("vehicleDetails.gallery.title")} onKeyDown={keyboard}>
      <svg className="vm-gallery-clip-definitions" width="0" height="0" aria-hidden="true" focusable="false">
        <defs><clipPath id={curveClipId} clipPathUnits="objectBoundingBox"><path d="M0 0H.909091C.915 .25 .99 .73 1 1H0Z" /></clipPath></defs>
      </svg>
      <div className="vm-gallery-stage" data-direction={direction} data-fit={fit ? "contain" : "cover"} {...pointerEvents}
        onClickCapture={event => { if (dragged.current) { event.preventDefault(); event.stopPropagation(); dragged.current = false; } }}>
        <div className="vm-curved-gallery-track" ref={panels}>
        {photos.map((photo, index) => (
          <figure key={photo.imagePath} className={`vm-gallery-panel ${index === active ? "is-active" : ""}`} data-photo-index={index} style={{ zIndex: photos.length - index }}>
            <div className="vm-gallery-panel-shape" style={{ clipPath: index < photos.length - 1 ? `url(#${curveClipId})` : "none" }} ref={node => { imageRefs.current[index] = node?.querySelector("img") || null; }}>
              <div className="vm-gallery-panel-media">
              <VanguardImage id={photo.imagePath} src={photo.image} alt={photo.imageAlt} width={1800} height={1100}
                loading={index < 2 ? "eager" : "lazy"} fetchPriority={index === 0 ? "high" : "auto"} draggable={false} />
              </div>
              <button type="button" className="vm-gallery-panel-open" aria-haspopup="dialog" onFocus={() => select(index)} onClick={() => openPhoto(index)}
                aria-label={`${t("vehicleDetails.gallery.enlargeLabel")}: ${photo.caption || t("vehicleDetails.gallery.title")} ${index + 1}`}>
                <span aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5" /></svg></span>
              </button>
            </div>
            <figcaption><span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><EditableText id={photo.captionPath}>{photo.caption}</EditableText></figcaption>
          </figure>
        ))}
        </div>
      </div>
      <div className="vm-curved-gallery-toolbar">
        <div className="vm-gallery-controls">
          <button type="button" className="vm-gallery-arrow" aria-label={t("vehicleDetails.gallery.previousLabel")} onClick={() => select(active - 1)} disabled={photos.length < 2}><Arrow back /></button>
          <button type="button" className="vm-gallery-arrow" aria-label={t("vehicleDetails.gallery.nextLabel")} onClick={() => select(active + 1)} disabled={photos.length < 2}><Arrow /></button>
        </div>
        <div className="vm-gallery-tools">
        <button type="button" className="vm-gallery-fit" aria-pressed={fit} onClick={() => setFit(value => !value)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M8 8v8m8-8v8" /></svg><EditableText id="vehicleDetails.gallery.fitLabel">{t("vehicleDetails.gallery.fitLabel")}</EditableText>
        </button>
        <button type="button" className="vm-gallery-enlarge" onClick={() => setExpanded(true)} aria-haspopup="dialog">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5" /></svg>
          <EditableText id="vehicleDetails.gallery.enlargeLabel">{t("vehicleDetails.gallery.enlargeLabel")}</EditableText>
        </button>
        </div>
      </div>
      <div className="vm-gallery-strip">
        <div className="vm-gallery-thumbnails" ref={thumbnails}>
          {photos.map((photo, index) => (
            <button key={photo.imagePath} type="button" className={index === active ? "is-active" : ""} onClick={() => select(index)} aria-pressed={index === active}
              aria-label={`${t("vehicleDetails.gallery.thumbnailLabel")} ${index + 1}: ${photo.caption}`}>
              <VanguardImage id={photo.imagePath} src={photo.image} alt="" width={180} height={115} loading="lazy" />
              <EditableText id={photo.captionPath}>{photo.caption}</EditableText>
            </button>
          ))}
        </div>
        <div className="vm-gallery-summary">
          <p className="vm-gallery-position" role="status" aria-live="polite" aria-atomic="true">{String(active + 1).padStart(2, "0")} <span>/ {String(photos.length).padStart(2, "0")}</span></p>
          <p><EditableText id="vehicleDetails.gallery.title">{t("vehicleDetails.gallery.title")}</EditableText><span aria-hidden="true"> · </span>{photos.length} <EditableText id="vehicleDetails.gallery.photoLabel">{t("vehicleDetails.gallery.photoLabel")}</EditableText></p>
        </div>
      </div>
      <div className="vm-gallery-notes"><EditableText id="vehicleDetails.gallery.photoNote" as="p">{t("vehicleDetails.gallery.photoNote")}</EditableText></div>
      <VehicleImageExplorer vehicleId={vehicleId} active={active} onSelect={select} />
      <noscript><div className="vm-gallery-no-js">{photos.map((photo, index) => <a href={withBasePath(photo.image)} key={photo.imagePath} target="_blank" rel="noreferrer">{t("vehicleDetails.gallery.openImageLabel")} {index + 1}</a>)}</div></noscript>

      {expanded && createPortal(
        <EditableDialog open onClose={() => setExpanded(false)} size="full" showCloseButton={false} className="vanguard vm-photo-viewer vm-cinematic-viewer" aria-labelledby="vehicle-viewer-title" data-motion={String(Boolean(content.motion.enabled))}
          style={{ padding: "20px", borderRadius: "12px", maxWidth: "1440px", maxHeight: "96svh", backgroundColor: "var(--vm-midnight)" }}>
          <div ref={viewer} onKeyDown={keyboard} className="vm-viewer-inner">
            <header className="vm-viewer-header"><div><h2 id="vehicle-viewer-title"><EditableText id={`cards.vehicles.${vehicleId}.name`}>{t(`cards.vehicles.${vehicleId}.name`)}</EditableText></h2><p>{String(active + 1).padStart(2, "0")} / {String(photos.length).padStart(2, "0")}</p></div>
              <button type="button" className="vm-viewer-close vm-icon-button" aria-label={t("vehicleDetails.gallery.closeLabel")} onClick={() => setExpanded(false)}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m6 6 12 12M6 18 18 6" /></svg></button>
            </header>
            <div className="vm-viewer-image" data-direction={direction} {...pointerEvents}>{photos.map((photo, index) => <figure key={photo.imagePath} className={slideClass(index)} aria-hidden={index !== active} inert={index !== active}><VanguardImage id={photo.imagePath} src={photo.image} alt={photo.imageAlt} width={1800} height={1200} draggable={false} /></figure>)}
              <button type="button" className="vm-gallery-arrow vm-viewer-prev" aria-label={t("vehicleDetails.gallery.previousLabel")} onClick={() => select(active - 1)} disabled={photos.length < 2}><Arrow back /></button>
              <button type="button" className="vm-gallery-arrow vm-viewer-next" aria-label={t("vehicleDetails.gallery.nextLabel")} onClick={() => select(active + 1)} disabled={photos.length < 2}><Arrow /></button>
            </div>
            <footer className="vm-viewer-footer"><EditableText id={photos[active].captionPath}>{photos[active].caption}</EditableText><EditableText id="vehicleDetails.gallery.keyboardHint">{t("vehicleDetails.gallery.keyboardHint")}</EditableText></footer>
          </div>
        </EditableDialog>, document.body,
      )}
    </section>
  );
}
