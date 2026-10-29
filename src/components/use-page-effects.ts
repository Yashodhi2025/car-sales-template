"use client";

import { useEffect, type RefObject } from "react";
import { patchStyleByPath } from "@deneb-ui/ui";
import { useSiteContent } from "@/lib/site-content";

/** Preserve saved editor styles and progressively enhance existing page targets. */
export function usePageEffects(root: RefObject<HTMLElement | null>) {
  const { data } = useSiteContent();
  useEffect(() => {
    for (const [path, properties] of Object.entries(data.styles)) {
      if (!properties || typeof properties !== "object") continue;
      const kind = document.querySelector(`[data-preview-style-target="${CSS.escape(path)}"]`)
        ?.getAttribute("data-preview-style-type") || "text";
      patchStyleByPath(path, kind as Parameters<typeof patchStyleByPath>[1], properties as Record<string, unknown>);
    }
  }, [data]);

  useEffect(() => {
    const node = root.current;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!node) return;
    node.dataset.editPreview = String(window.self !== window.top);
    node.dataset.motion = String(Boolean(data.content.motion.enabled));
    if (reduced.matches || !data.content.motion.enabled || window.self !== window.top || document.documentElement.dataset.fivoraLocalEditMode === "true" || !("IntersectionObserver" in window) || typeof node.animate !== "function") return;
    const duration = Math.max(150, Math.min(1200, Number(data.content.motion.durationMs) || 750));
    const animations = new Set<Animation>();
    let stopped = false;
    const textTargets = new Map<HTMLElement, number>();
    const textGroup = ".vm-section-heading,.vm-brands-heading,.vm-car-section-heading";
    const title = node.querySelector<HTMLElement>("h1");
    const hero = title?.closest(".vm-hero,.vm-services-hero,.vm-about-opening,.vm-contact-opening,.vm-car-intro,header");
    if (title) {
      const lines = title.querySelectorAll<HTMLElement>(".vm-hero-line");
      (lines.length ? [...lines] : [title]).forEach((line,index) => textTargets.set(line,70 + index*90));
    }
    hero?.querySelectorAll<HTMLElement>(".vm-hero-description,.vm-services-hero-description,.vm-copy,.vm-car-meta,[data-preview-field-path='inventory.hero.description']")
      .forEach(description => textTargets.set(description,250));
    node.querySelectorAll<HTMLElement>("h2,.vm-copy,.vm-section-description,.service-card-description").forEach(target => {
      // Existing card/image wrappers retain their own entrance; avoid nested fades.
      if (hero?.contains(target) || target.closest("[data-hero-animation],.vm-vehicle-card,.vm-review,.vm-gallery-slide")) return;
      const wrapper = target.closest("[data-reveal]");
      if (wrapper && !wrapper.matches(textGroup)) return;
      textTargets.set(target,target.matches("h2") ? 0 : 90);
    });
    const observer = new IntersectionObserver(entries => {
      if (stopped || reduced.matches || node.dataset.editPreview === "true") return;
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const target = entry.target as HTMLElement;
        const text = textTargets.has(target);
        const animation = entry.target.animate(
          [{ opacity: text ? .15 : .35, transform: `translateY(${text ? 12 : 24}px)` }, { opacity: 1, transform: "translateY(0)" }],
          { duration, delay: text ? textTargets.get(target) : Math.min(Number(target.dataset.revealOrder || 0) * 55, 165), easing: "cubic-bezier(.16,1,.3,1)", fill: "backwards" },
        );
        animations.add(animation);
        animation.onfinish = () => animations.delete(animation);
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.12 });
    node.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el, index) => {
      if (el.matches(textGroup)) return;
      el.dataset.revealOrder = String(index % 3);
      observer.observe(el);
    });
    textTargets.forEach((_,target) => { target.dataset.textReveal = "true"; observer.observe(target); });
    let frame = 0;
    const scroll = () => {
      if (stopped || frame || reduced.matches || node.dataset.editPreview === "true") return;
      frame = requestAnimationFrame(() => {
        node.style.setProperty("--hero-offset", `${Math.min(window.scrollY * 0.12, 85)}px`);
        frame = 0;
      });
    };
    const stopMotion = () => {
      stopped = true;
      observer.disconnect();
      animations.forEach(animation => animation.cancel());
      animations.clear();
      cancelAnimationFrame(frame);
      frame = 0;
      node.style.setProperty("--hero-offset", "0px");
    };
    const preference = () => { if (reduced.matches) stopMotion(); };
    const editing = () => { if (document.documentElement.dataset.fivoraLocalEditMode === "true") stopMotion(); };
    const editObserver = new MutationObserver(editing);
    editObserver.observe(document.documentElement,{ attributes: true, attributeFilter: ["data-fivora-local-edit-mode"] });
    const previewMode = (event: MessageEvent) => {
      if (!(event.source === window.parent || (event.source === window && event.origin === location.origin)) || !["FIVORA_PREVIEW_EDIT_MODE","MARKETPLACE_PREVIEW_EDIT_MODE"].includes(event.data?.type)) return;
      node.dataset.editPreview = String(event.data.editMode === true || window.self !== window.top);
      if (event.data.editMode === true) stopMotion();
    };
    window.addEventListener("scroll", scroll, { passive: true });
    window.addEventListener("message",previewMode);
    reduced.addEventListener("change", preference);
    return () => {
      observer.disconnect();
      animations.forEach(animation => animation.cancel());
      window.removeEventListener("scroll", scroll);
      window.removeEventListener("message",previewMode);
      reduced.removeEventListener("change", preference);
      editObserver.disconnect();
      textTargets.forEach((_,target) => { delete target.dataset.textReveal; });
      cancelAnimationFrame(frame);
    };
  }, [root, data.content.motion.enabled, data.content.motion.durationMs]);
}
