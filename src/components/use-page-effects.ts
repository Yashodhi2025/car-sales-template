"use client";

import { useEffect, type RefObject } from "react";
import { patchStyleByPath } from "@deneb-ui/ui";
import { useSiteContent } from "@/lib/site-content";

/** The Phase 1 motion and saved-style behavior, shared by the template pages. */
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
    if (reduced.matches || !data.content.motion.enabled || window.self !== window.top || !("IntersectionObserver" in window)) return;
    const duration = Math.max(150, Math.min(1200, Number(data.content.motion.durationMs) || 750));
    const animations = new Set<Animation>();
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const animation = entry.target.animate(
          [{ opacity: 0.35, transform: "translateY(24px)" }, { opacity: 1, transform: "translateY(0)" }],
          { duration, delay: Math.min(Number((entry.target as HTMLElement).dataset.revealOrder || 0) * 55, 165), easing: "cubic-bezier(.16,1,.3,1)" },
        );
        animations.add(animation);
        animation.onfinish = () => animations.delete(animation);
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.12 });
    node.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el, index) => { el.dataset.revealOrder = String(index % 3); observer.observe(el); });
    let frame = 0;
    const scroll = () => {
      if (frame || reduced.matches) return;
      frame = requestAnimationFrame(() => {
        node.style.setProperty("--hero-offset", `${Math.min(window.scrollY * 0.12, 85)}px`);
        frame = 0;
      });
    };
    const stopMotion = () => {
      if (!reduced.matches) return;
      observer.disconnect();
      animations.forEach(animation => animation.cancel());
      node.style.setProperty("--hero-offset", "0px");
    };
    window.addEventListener("scroll", scroll, { passive: true });
    reduced.addEventListener("change", stopMotion);
    return () => {
      observer.disconnect();
      animations.forEach(animation => animation.cancel());
      window.removeEventListener("scroll", scroll);
      reduced.removeEventListener("change", stopMotion);
      cancelAnimationFrame(frame);
    };
  }, [root, data.content.motion.enabled, data.content.motion.durationMs]);
}
