"use client";

import { useEffect, useRef, useState, type AnimationEvent } from "react";
import { DENEB_PREVIEW_FOCUS_MESSAGE, LEGACY_PREVIEW_FOCUS_MESSAGE, PREVIEW_FOCUS_MESSAGE, EditableText, withBasePath } from "@deneb-ui/ui";
import { useSiteContent, type VehicleId } from "@/lib/site-content";
import { carHref, carPageKey } from "@/lib/vehicles";
import { VanguardImage } from "./vanguard-image";
import { Arrow } from "./vanguard-arrow";
import styles from "./inventory-showcase-scene.module.css";

/** A curated side-profile drive, independent of the complete stock list below. */
export function InventoryShowcase() {
  const { data, content, t } = useSiteContent();
  const stock = Object.keys(content.cards.vehicles) as VehicleId[];
  const [selected, setSelected] = useState<string>("");
  const [manual, setManual] = useState(false);
  const [editing, setEditing] = useState(false);
  const [reduced, setReduced] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const focusFrame = useRef(0);
  const playlist = stock.filter(id => content.inventory.showcase?.featured?.[id]?.enabled === true && Boolean(t(`photos.vehicles.${id}.showcaseImage`).trim()))
    .sort((a, b) => Number(content.inventory.showcase?.featured?.[a]?.order || 0) - Number(content.inventory.showcase?.featured?.[b]?.order || 0));
  // An unselected car can be previewed while its optional cutout is being edited.
  const ids = editing && stock.includes(selected as VehicleId) && !playlist.includes(selected as VehicleId)
    ? [...playlist, selected as VehicleId] : playlist;
  const active = ids.find(id => id === selected) || ids[0];
  const index = active ? ids.indexOf(active) : 0;
  const next = ids[(index + 1) % Math.max(1, ids.length)];
  const running = Boolean(content.motion.enabled) && !reduced && !editing && !manual && ids.length > 1;

  useEffect(() => {
    const node = root.current;
    if (!node) return;
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const preference = () => setReduced(media.matches);
    const visibility = () => { node.dataset.pageVisible = String(!document.hidden); };
    const observer = new IntersectionObserver(([entry]) => { node.dataset.inView = String(entry.isIntersecting); }, { threshold: .05 });
    observer.observe(node);
    preference();
    visibility();
    media.addEventListener("change", preference);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      observer.disconnect();
      media.removeEventListener("change", preference);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);

  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (!(event.source === window.parent || (event.source === window && event.origin === location.origin))) return;
      if (["FIVORA_PREVIEW_EDIT_MODE", "MARKETPLACE_PREVIEW_EDIT_MODE"].includes(event.data?.type)) {
        setEditing(event.data.editMode === true);
        if (!event.data.editMode) setManual(false);
        return;
      }
      if (![PREVIEW_FOCUS_MESSAGE, DENEB_PREVIEW_FOCUS_MESSAGE, LEGACY_PREVIEW_FOCUS_MESSAGE].includes(event.data?.type)) return;
      const path = String(event.data.fieldPath || "");
      const match = path.match(/^(?:(?:photos|cards)\.vehicles|vehicles|inventory\.showcase\.featured)\.([^.]+)(?:\.|$)/);
      if (!match || !Object.hasOwn(content.cards.vehicles, match[1])) return;
      setSelected(match[1]);
      setManual(true);
      if (path.endsWith(".showcaseImage")) {
        setEditing(true);
        cancelAnimationFrame(focusFrame.current);
        focusFrame.current = requestAnimationFrame(() => {
          root.current?.querySelector(`[data-preview-field-path="${CSS.escape(path)}"]`)?.scrollIntoView({ block: "center", behavior: "instant" });
        });
      }
    };
    window.addEventListener("message", receive);
    return () => { window.removeEventListener("message", receive); cancelAnimationFrame(focusFrame.current); };
  }, [content.cards.vehicles]);

  function select(id: string) {
    setSelected(id);
  }
  function advance(event: AnimationEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget && running && next) setSelected(next);
  }

  return <header className={`vm-container ${styles.root}`}>
    <nav className={`vm-breadcrumb ${styles.breadcrumb}`} aria-label="Breadcrumb">
      <a href={withBasePath("/")} data-preview-field-path="common.navLinks.home"><EditableText id="common.navLabels.home">{t("common.navLabels.home")}</EditableText></a>
      <span aria-hidden="true">/</span><EditableText id="common.navLabels.collection">{t("common.navLabels.collection")}</EditableText>
    </nav>
    <div className={styles.heroLayout}>
    <div className={styles.intro}>
      <div><EditableText id="inventory.hero.eyebrow" as="p" className="vm-eyebrow">{t("inventory.hero.eyebrow")}</EditableText><EditableText id="inventory.hero.title" as="h1" className={styles.title}>{t("inventory.hero.title")}</EditableText></div>
      <EditableText id="inventory.hero.description" as="p" className={styles.description}>{t("inventory.hero.description")}</EditableText>
    </div>

    <div ref={root} className={styles.showcase} data-inventory-showcase data-hero-animation data-running={running} data-editing={editing}
      onPointerEnter={event => { if (event.pointerType === "mouse") event.currentTarget.dataset.hover = "true"; }}
      onPointerLeave={event => { event.currentTarget.dataset.hover = "false"; }}
      onKeyDown={event => {
        if ((event.target as HTMLElement).isContentEditable || !ids.length) return;
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
          event.preventDefault();
          select(ids[(index + (event.key === "ArrowRight" ? 1 : -1) + ids.length) % ids.length]);
        }
      }}>
      <div className={styles.stage} role="region" aria-roledescription="carousel" aria-label={t("inventory.showcase.label")}>
        <div className={styles.selectors} role="group" aria-label={t("inventory.showcase.selectLabel")}>
          {ids.map(id => <button key={id} type="button" className={styles.selector} aria-label={`${t("inventory.showcase.selectLabel")}: ${t(`cards.vehicles.${id}.name`)}`} aria-pressed={id === active} onClick={() => select(id)}>{t(`cards.vehicles.${id}.name`)}</button>)}
        </div>
        {ids.map(id => {
          const cardPath = `cards.vehicles.${id}`;
          const photoPath = `photos.vehicles.${id}.showcaseImage`;
          const source = t(photoPath);
          return <div key={id} className={styles.slide} data-showcase-vehicle={id} data-active={id === active} aria-hidden={id !== active} inert={id !== active}>
            <div className={styles.model} aria-live={manual ? "polite" : "off"}>
              <EditableText id={`${cardPath}.name`} data-preview-field-path={`${cardPath}.name`} as="h2">{t(`${cardPath}.name`)}</EditableText>
              <EditableText id={`${cardPath}.meta`} data-preview-field-path={`${cardPath}.meta`} as="p">{t(`${cardPath}.meta`)}</EditableText>
            </div>
            <div className={styles.vehicleMotion} onAnimationIteration={advance}>
              <div className={styles.carShadow} aria-hidden="true" />
              <VanguardImage id={photoPath} data-preview-field-path={photoPath} src={source} alt={t(`${cardPath}.name`)} fit="contain" width={2100} height={780}
                loading={id === active || id === next ? "eager" : "lazy"} fetchPriority={id === active ? "high" : "auto"} className={styles.photo} draggable={false} />
            </div>
            <div className={styles.facts}>
              <div><EditableText id={`vehicles.${id}.engine`} data-preview-field-path={`vehicles.${id}.engine`} as="p">{t(`vehicles.${id}.engine`)}</EditableText><EditableText id="vehicleDetails.labels.engine" className={styles.factLabel}>{t("vehicleDetails.labels.engine")}</EditableText></div>
              <div><EditableText id={`${cardPath}.transmission`} data-preview-field-path={`${cardPath}.transmission`} as="p">{t(`${cardPath}.transmission`)}</EditableText><EditableText id="vehicleDetails.labels.transmission" className={styles.factLabel}>{t("vehicleDetails.labels.transmission")}</EditableText></div>
            </div>
          </div>;
        })}
        {!ids.length && <div className={styles.empty}><EditableText id="inventory.showcase.emptyTitle" as="h2">{t("inventory.showcase.emptyTitle")}</EditableText><EditableText id="inventory.showcase.emptyDescription" as="p">{t("inventory.showcase.emptyDescription")}</EditableText></div>}
      </div>
      <div className={styles.footer}><EditableText id="inventory.hero.imageCaption" className={styles.caption}>{t("inventory.hero.imageCaption")}</EditableText>
        {active && data.requirements.requiredPages.includes(carPageKey(active)) && <a className={styles.discover} href={withBasePath(carHref(active))}><EditableText id="inventory.showcase.viewLabel">{t("inventory.showcase.viewLabel")}</EditableText><Arrow /></a>}
      </div>
    </div>
    </div>
  </header>;
}
