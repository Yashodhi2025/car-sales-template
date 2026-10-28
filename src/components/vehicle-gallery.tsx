"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { EditableDialog, EditableText, withBasePath } from "@deneb-ui/ui";
import { VanguardImage } from "./vanguard-image";
import { useSiteContent, type VehicleId } from "@/lib/site-content";
import { vehiclePhotos } from "@/lib/vehicles";
import { Arrow } from "./vanguard-arrow";
import { useVehiclePhotoFocus } from "./use-vehicle-photo-focus";

/** Vanguard-only gallery composition; editable UI remains the installed Deneb UI. */
export function VehicleGallery({ vehicleId }: { vehicleId: VehicleId }) {
  const { content, t } = useSiteContent();
  const photos = vehiclePhotos(content, vehicleId);
  const [selected, setSelected] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const active = Math.min(selected, photos.length - 1);
  const imageRefs = useRef<(HTMLImageElement | null)[]>([]);
  const viewer = useRef<HTMLDivElement>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const request = useRef(0);
  const focusPhoto = useCallback((index: number) => { request.current++; setSelected(index); }, []);
  useVehiclePhotoFocus(vehicleId, photos.length, focusPhoto);

  function select(index: number) {
    const next = (index + photos.length) % photos.length;
    const ticket = ++request.current;
    const image = imageRefs.current[next];
    if (!image || image.complete) { setSelected(next); return; }
    // Preserve the visible image while a lazy photo decodes; cancel stale clicks.
    void image.decode().catch(() => undefined).then(() => { if (request.current === ticket) setSelected(next); });
  }
  function keyboard(event: KeyboardEvent<HTMLElement>) {
    const target = event.target as HTMLElement;
    if (target.isContentEditable || target.closest("input,textarea,select")) return;
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault(); event.stopPropagation(); select(active + (event.key === "ArrowRight" ? 1 : -1));
    }
  }
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
    <section className="vm-car-gallery" aria-label={t("vehicleDetails.gallery.title")} onKeyDown={keyboard}>
      <div className="vm-gallery-stage"
        onPointerDown={event => { if (event.pointerType === "touch" && window.self === window.top) touch.current = { x: event.clientX, y: event.clientY }; }}
        onPointerCancel={() => { touch.current = null; }}
        onPointerUp={event => {
          if (!touch.current) return;
          const dx = event.clientX - touch.current.x, dy = event.clientY - touch.current.y;
          touch.current = null;
          if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.3) select(active + (dx < 0 ? 1 : -1));
        }}>
        {photos.map((photo, index) => (
          <figure key={photo.imagePath} className={`vm-gallery-slide ${index === active ? "is-active" : ""}`} aria-hidden={index !== active} inert={index !== active} data-photo-index={index}>
            <div ref={node => { imageRefs.current[index] = node?.querySelector("img") || null; }}>
              <VanguardImage id={photo.imagePath} src={photo.image} alt={photo.imageAlt} width={1800} height={1100}
                loading={index === 0 ? "eager" : "lazy"} fetchPriority={index === 0 ? "high" : "auto"} draggable={false} />
            </div>
            <figcaption><EditableText id={photo.captionPath}>{photo.caption}</EditableText></figcaption>
          </figure>
        ))}
        <div className="vm-gallery-controls">
          <button type="button" className="vm-gallery-arrow" aria-label={t("vehicleDetails.gallery.previousLabel")} onClick={() => select(active - 1)} disabled={photos.length < 2}><Arrow back /></button>
          <button type="button" className="vm-gallery-arrow" aria-label={t("vehicleDetails.gallery.nextLabel")} onClick={() => select(active + 1)} disabled={photos.length < 2}><Arrow /></button>
        </div>
        <button type="button" className="vm-gallery-enlarge" onClick={() => setExpanded(true)} aria-haspopup="dialog">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5" /></svg>
          <EditableText id="vehicleDetails.gallery.enlargeLabel">{t("vehicleDetails.gallery.enlargeLabel")}</EditableText>
        </button>
      </div>
      <div className="vm-gallery-strip">
        <div className="vm-gallery-thumbnails">
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
      <div className="vm-gallery-notes"><EditableText id="vehicleDetails.gallery.photoNote" as="p">{t("vehicleDetails.gallery.photoNote")}</EditableText><EditableText id="vehicleDetails.gallery.keyboardHint" as="p">{t("vehicleDetails.gallery.keyboardHint")}</EditableText></div>
      <noscript><div className="vm-gallery-no-js">{photos.map((photo, index) => <a href={withBasePath(photo.image)} key={photo.imagePath} target="_blank" rel="noreferrer">{t("vehicleDetails.gallery.openImageLabel")} {index + 1}</a>)}</div></noscript>

      {expanded && createPortal(
        <EditableDialog open onClose={() => setExpanded(false)} size="full" showCloseButton={false} className="vanguard vm-photo-viewer" aria-labelledby="vehicle-viewer-title"
          style={{ padding: "20px", borderRadius: "4px", maxWidth: "1320px", maxHeight: "96svh", backgroundColor: "#0a0c0f" }}>
          <div ref={viewer} onKeyDown={keyboard} className="vm-viewer-inner">
            <header className="vm-viewer-header"><div><h2 id="vehicle-viewer-title"><EditableText id={`cards.vehicles.${vehicleId}.name`}>{t(`cards.vehicles.${vehicleId}.name`)}</EditableText></h2><p>{String(active + 1).padStart(2, "0")} / {String(photos.length).padStart(2, "0")}</p></div>
              <button type="button" className="vm-viewer-close vm-icon-button" aria-label={t("vehicleDetails.gallery.closeLabel")} onClick={() => setExpanded(false)}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m6 6 12 12M6 18 18 6" /></svg></button>
            </header>
            <div className="vm-viewer-image"><VanguardImage key={photos[active].imagePath} id={photos[active].imagePath} src={photos[active].image} alt={photos[active].imageAlt} width={1800} height={1200} />
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
