"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";

export const vehicleSections = [
  { key: "overview", target: "vehicle-overview" },
  { key: "specifications", target: "vehicle-specifications" },
  { key: "features", target: "vehicle-features" },
  { key: "viewing", target: "request-viewing" },
] as const;
type SectionKey = typeof vehicleSections[number]["key"];

/** Anchor navigation and scroll tracking; every section stays visible. */
export function useVehicleSections(root: RefObject<HTMLElement | null>, motionEnabled: boolean) {
  const [active, setActive] = useState<SectionKey>("overview");
  const [ready, setReady] = useState(false);
  const nav = useRef<HTMLElement>(null);
  const current = useRef<SectionKey>("overview");
  const pending = useRef<{ key: SectionKey; destination: number; until: number } | null>(null);
  const reveal = useRef<Animation | null>(null);
  const queueUpdate = useRef<() => void>(() => {});
  const initialHashHandled = useRef(false);
  const motionAllowed = useCallback(() => motionEnabled && window.self === window.top && !window.matchMedia("(prefers-reduced-motion: reduce)").matches, [motionEnabled]);
  const markActive = useCallback((key: SectionKey) => { if (current.current !== key) { current.current = key; setActive(key); } }, []);
  const sectionElement = useCallback((key: SectionKey) => root.current?.querySelector<HTMLElement>(`#${vehicleSections.find(section => section.key === key)!.target}`), [root]);

  const offset = useCallback(() => {
    const headerBottom = document.querySelector(".vm-header")?.getBoundingClientRect().bottom || 76;
    const top = Math.ceil(headerBottom + 12);
    const height = nav.current?.offsetHeight || 80;
    nav.current?.style.setProperty("--vm-section-nav-top", `${top}px`);
    root.current?.style.setProperty("--vm-section-nav-height", `${height}px`);
    return top + height + 18;
  }, [root]);

  const navigate = useCallback((key: SectionKey, pushHistory = false) => {
    const target = sectionElement(key);
    if (!target) return;
    reveal.current?.cancel();
    const destination = Math.max(0, Math.min(target.getBoundingClientRect().top + window.scrollY - offset(), document.documentElement.scrollHeight - innerHeight));
    pending.current = { key, destination, until: performance.now() + 1800 };
    markActive(key);
    if (pushHistory) {
      const hash = `#${vehicleSections.find(section => section.key === key)!.target}`;
      if (location.hash !== hash) history.pushState(history.state, "", hash);
    }
    window.scrollTo({ top: destination, behavior: motionAllowed() ? "smooth" : "instant" });
    queueUpdate.current();
  }, [markActive, motionAllowed, offset, sectionElement]);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const line = offset() + 40;
      const journey = pending.current;
      if (journey) {
        if (Math.abs(window.scrollY - journey.destination) < 4 || performance.now() >= journey.until) {
          pending.current = null;
          const target = sectionElement(journey.key);
          if (target && motionAllowed() && typeof target.animate === "function") reveal.current = target.animate([{ opacity: .55, transform: "translateY(18px)" }, { opacity: 1, transform: "translateY(0)" }], { duration: 520, easing: "cubic-bezier(.16,1,.3,1)" });
        } else { frame = requestAnimationFrame(update); return; }
      }
      let visible: SectionKey = "overview";
      for (const section of vehicleSections) {
        const node = sectionElement(section.key);
        if (node && node.getBoundingClientRect().top <= line) visible = section.key;
      }
      markActive(visible);
    };
    const queue = () => { if (!frame) frame = requestAnimationFrame(update); };
    queueUpdate.current = queue;
    const interrupt = () => { pending.current = null; queue(); };
    const keyInterrupt = (event: KeyboardEvent) => { if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "].includes(event.key)) interrupt(); };
    const resize = () => { pending.current = null; queue(); };
    const fromHash = () => {
      let hash = location.hash.slice(1);
      try { hash = decodeURIComponent(hash); } catch { return; }
      const section = vehicleSections.find(item => item.target === hash || (item.key === "viewing" && hash === "vehicle-viewing-panel"));
      if (section) navigate(section.key);
      else queue();
    };
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const stopMotion = () => { if (reduced.matches) { interrupt(); reveal.current?.cancel(); window.scrollTo({ top: window.scrollY, behavior: "instant" }); } };
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", resize);
    window.addEventListener("wheel", interrupt, { passive: true });
    window.addEventListener("touchstart", interrupt, { passive: true });
    window.addEventListener("pointerdown", interrupt, { passive: true });
    window.addEventListener("keydown", keyInterrupt);
    window.addEventListener("hashchange", fromHash);
    window.addEventListener("popstate", fromHash);
    reduced.addEventListener("change", stopMotion);
    if (!initialHashHandled.current) { initialHashHandled.current = true; fromHash(); }
    queue();
    setReady(true);
    return () => {
      window.removeEventListener("scroll", queue);
      window.removeEventListener("resize", resize);
      window.removeEventListener("wheel", interrupt);
      window.removeEventListener("touchstart", interrupt);
      window.removeEventListener("pointerdown", interrupt);
      window.removeEventListener("keydown", keyInterrupt);
      window.removeEventListener("hashchange", fromHash);
      window.removeEventListener("popstate", fromHash);
      reduced.removeEventListener("change", stopMotion);
      cancelAnimationFrame(frame);
      reveal.current?.cancel();
      pending.current = null;
      queueUpdate.current = () => {};
    };
  }, [markActive, motionAllowed, navigate, offset, sectionElement]);

  return { active, ready, nav, navigate };
}
