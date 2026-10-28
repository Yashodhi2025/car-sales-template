"use client";

import { useRef, useState } from "react";
import { EditableText } from "@deneb-ui/ui";
import { useSiteContent, type VehicleId } from "@/lib/site-content";
import { vehiclePhotos } from "@/lib/vehicles";
import { VanguardImage } from "./vanguard-image";
import { Arrow } from "./vanguard-arrow";
import { useVehiclePhotoFocus } from "./use-vehicle-photo-focus";

/** Honest alternative to a 360 spin: the available stock/reference photographs.
 * Uses the same editable photo entries as the main gallery, without synthesizing angles. */
export function VehicleImageExplorer({ vehicleId }: { vehicleId: VehicleId }) {
  const { content, t } = useSiteContent();
  const photos = vehiclePhotos(content, vehicleId);
  const [selected, setSelected] = useState(0);
  useVehiclePhotoFocus(vehicleId, photos.length, setSelected);
  const drag = useRef<{ x: number; y: number } | null>(null);
  const active = Math.min(selected, photos.length - 1);
  const select = (index: number) => setSelected((index + photos.length) % photos.length);
  return <section className="vm-image-explorer" aria-labelledby="explorer-title"><div className="vm-container vm-explorer-layout">
    <div className="vm-explorer-copy" data-reveal>
      <EditableText id="vehicleDetails.explorer.eyebrow" as="p" className="vm-eyebrow">{t("vehicleDetails.explorer.eyebrow")}</EditableText>
      <h2 id="explorer-title" className="vm-title"><EditableText id="vehicleDetails.explorer.title">{t("vehicleDetails.explorer.title")}</EditableText></h2>
      <EditableText id="vehicleDetails.explorer.description" as="p" className="vm-copy">{t("vehicleDetails.explorer.description")}</EditableText>
      <EditableText id="vehicleDetails.explorer.notice" as="p" className="vm-explorer-note">{t("vehicleDetails.explorer.notice")}</EditableText>
      <div className="vm-explorer-views">{photos.map((photo,index)=><button type="button" key={photo.imagePath} aria-pressed={index===active} onClick={()=>select(index)}><EditableText id="vehicleDetails.explorer.viewLabel">{t("vehicleDetails.explorer.viewLabel")}</EditableText> {String(index+1).padStart(2,"0")}</button>)}</div>
    </div>
    <div><div className="vm-explorer-stage" role="region" aria-roledescription="carousel" aria-label={t("vehicleDetails.explorer.title")} tabIndex={0}
      onKeyDown={event=>{if((event.target as HTMLElement).isContentEditable)return;if(event.key==="ArrowLeft"||event.key==="ArrowRight"){event.preventDefault();select(active+(event.key==="ArrowRight"?1:-1));}}}
      onPointerDown={event=>{if(window.self!==window.top||event.button!==0)return;drag.current={x:event.clientX,y:event.clientY};event.currentTarget.setPointerCapture(event.pointerId);}}
      onPointerCancel={()=>{drag.current=null;}}
      onPointerUp={event=>{if(!drag.current)return;const dx=event.clientX-drag.current.x,dy=event.clientY-drag.current.y;drag.current=null;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.2)select(active+(dx<0?1:-1));}}>
      {photos.map((photo,index)=><div key={photo.imagePath} className={`vm-explorer-photo ${index===active?"is-active":""}`} aria-hidden={index!==active} inert={index!==active}><VanguardImage id={photo.imagePath} src={photo.image} alt={photo.imageAlt} width={1400} height={950} draggable={false} /></div>)}
    </div><div className="vm-explorer-controls"><button type="button" className="vm-icon-button" onClick={()=>select(active-1)} disabled={photos.length<2} aria-label={t("vehicleDetails.gallery.previousLabel")}><Arrow back /></button><div className="vm-explorer-position"><p aria-live="polite" aria-atomic="true">{String(active+1).padStart(2,"0")} / {String(photos.length).padStart(2,"0")} · <EditableText id={photos[active].captionPath}>{photos[active].caption}</EditableText></p><EditableText id="vehicleDetails.explorer.hint" as="p">{t("vehicleDetails.explorer.hint")}</EditableText></div><button type="button" className="vm-icon-button" onClick={()=>select(active+1)} disabled={photos.length<2} aria-label={t("vehicleDetails.gallery.nextLabel")}><Arrow /></button></div></div>
  </div></section>;
}
