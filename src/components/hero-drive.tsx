"use client";

import { useEffect, useId, useRef, useState } from "react";
import styles from "./hero-drive.module.css";

/** A live, vector-built night drive. No image or video download is needed. */
export function HeroDrive() {
  const [paused, setPaused] = useState(false);
  const [editing, setEditing] = useState(false);
  const scene = useRef<HTMLDivElement>(null);
  const id = useId().replace(/:/g, "");
  const paint = (name: string) => `url(#${id}-${name})`;

  useEffect(() => {
    const node = scene.current;
    if (!node) return;
    const visibility = () => { node.dataset.active = String(!document.hidden); };
    const editMode = (event: MessageEvent) => {
      if (event.source !== window.parent || !["FIVORA_PREVIEW_EDIT_MODE", "MARKETPLACE_PREVIEW_EDIT_MODE"].includes(event.data?.type)) return;
      setEditing(event.data.editMode === true);
    };
    const observer = new IntersectionObserver(([entry]) => {
      node.dataset.visible = String(entry.isIntersecting);
    });
    observer.observe(node);
    visibility();
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("message", editMode);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("message", editMode);
    };
  }, []);

  return <>
    <div ref={scene} className={styles.scene} data-hero-animation data-paused={paused} data-editing={editing} aria-hidden="true">
      <div className={styles.halo} />
      <div className={styles.horizon} />
      <div className={styles.tunnel}>
        {[0, 1, 2, 3, 4].map(index => <span key={index} style={{ animationDelay: `${index * -1.8}s` }} />)}
      </div>
      <div className={styles.streaks}>
        {[0, 1, 2, 3, 4, 5].map(index => <span key={index} style={{ top: `${26 + index * 10}%`, animationDelay: `${index * -.73}s`, animationDuration: `${2.4 + index * .27}s` }} />)}
      </div>
      <div className={styles.road} />
      <div className={styles.carPosition}>
        <svg className={styles.car} viewBox="0 0 1100 430" fill="none" focusable="false">
          <defs>
            <linearGradient id={`${id}-body`} x1="580" y1="120" x2="580" y2="345" gradientUnits="userSpaceOnUse">
              <stop stopColor="#b5c5d3" /><stop offset=".22" stopColor="#475a6c" /><stop offset=".43" stopColor="#192733" /><stop offset=".57" stopColor="#394c5c" /><stop offset=".76" stopColor="#101b26" /><stop offset="1" stopColor="#070d14" />
            </linearGradient>
            <linearGradient id={`${id}-glass`} x1="520" y1="119" x2="570" y2="235" gradientUnits="userSpaceOnUse">
              <stop stopColor="#081421" /><stop offset=".5" stopColor="#1b3448" /><stop offset="1" stopColor="#060d15" />
            </linearGradient>
            <linearGradient id={`${id}-edge`} x1="94" y1="220" x2="1020" y2="240" gradientUnits="userSpaceOnUse">
              <stop stopColor="#69829a" stopOpacity="0" /><stop offset=".35" stopColor="#bfdae9" /><stop offset=".75" stopColor="#67879e" /><stop offset="1" stopColor="#e0eff7" />
            </linearGradient>
            <linearGradient id={`${id}-rim`} x1="0" y1="0" x2="1" y2="1">
              <stop stopColor="#b0bdc8" /><stop offset=".45" stopColor="#344452" /><stop offset="1" stopColor="#93a5b4" />
            </linearGradient>
            <radialGradient id={`${id}-shadow`}><stop stopColor="#000" stopOpacity=".85" /><stop offset="1" stopColor="#000" stopOpacity="0" /></radialGradient>
            <linearGradient id={`${id}-beam`}><stop stopColor="#b9e3ff" stopOpacity=".28" /><stop offset="1" stopColor="#b9e3ff" stopOpacity="0" /></linearGradient>
            <linearGradient id={`${id}-reflection`}><stop stopColor="#82b9da" stopOpacity="0" /><stop offset=".5" stopColor="#c4e9ff" stopOpacity=".55" /><stop offset="1" stopColor="#82b9da" stopOpacity="0" /></linearGradient>
            <clipPath id={`${id}-body-clip`}><path d="M91 268 111 222Q117 210 150 207L271 190 358 137Q389 117 452 115L578 118Q632 124 702 173L760 205 939 224Q996 232 1015 260L1028 296Q1029 316 1006 323L960 327Q957 246 883 246Q805 247 803 332L331 332Q326 250 253 250Q178 250 172 328L112 321Q84 314 91 268Z" /></clipPath>
          </defs>

          <ellipse cx="561" cy="362" rx="510" ry="48" fill={paint("shadow")} />
          <path d="m993 262 107-30v112l-107-53Z" fill={paint("beam")} className={styles.headlightBeam} />
          <g className={styles.chassis}>
            <path d="m111 222 17-20 121-12 22 5-11 13Z" fill="#101d28" />
            <path d="M91 268 111 222Q117 210 150 207L271 190 358 137Q389 117 452 115L578 118Q632 124 702 173L760 205 939 224Q996 232 1015 260L1028 296Q1029 316 1006 323L960 327Q957 246 883 246Q805 247 803 332L331 332Q326 250 253 250Q178 250 172 328L112 321Q84 314 91 268Z" fill={paint("body")} stroke="#8399aa" strokeWidth="1.3" />
            <path d="m302 193 69-48q27-18 78-18l123 3q48 6 110 50l31 23-193-6Z" fill={paint("glass")} stroke="#708898" strokeWidth="2" />
            <path d="m448 128-23 68m151-64 45 68" stroke="#080f18" strokeWidth="10" />
            <path d="m311 191 116-48 139-7" stroke="#7194ac" strokeOpacity=".35" strokeWidth="2" />
            <path d="M119 233q233-26 591-14l248 24" stroke={paint("edge")} strokeWidth="2" />
            <path d="M329 305q217 17 461 0l-17 18H342Z" fill="#070e16" />
            <path d="M340 316q200 10 435-2" stroke="#5f798d" strokeOpacity=".6" />
            <path d="m428 208-12 75q-2 15 12 21m188-98 17 81q2 14-13 18" stroke="#0a131e" strokeWidth="2" />
            <path d="m453 226 34 1m159 6 30 1" stroke="#a5b7c5" strokeWidth="3" strokeLinecap="round" />
            <path d="m703 196 17-9q13-5 24 4l11 14-45 2Z" fill="#283c4d" stroke="#9aafbe" />
            <path d="M770 213q121 11 199 32M758 221l69 23" stroke="#b1c7d5" strokeOpacity=".3" />
            <path d="m957 249 39 8 10 14-52-8q-9-4 3-14Z" fill="#e8f8ff" />
            <path d="m959 253 36 8m-34-2 38 8" stroke="#9fddff" strokeWidth="2" />
            <path d="m1000 289 20 1-2 14-32 5 5-13Z" fill="#03080e" />
            <path d="m977 294 7 13m10-17 4 15m7-14 3 12" stroke="#496073" strokeWidth="2" />
            <path d="m103 234 49-5-5 11-48 7Z" fill="#eb6461" />
            <path d="m104 235 42-4" stroke="#ffaba0" strokeWidth="3" className={styles.tailLight} />
            <path d="m94 291 44 7-4 11-39-7Z" fill="#04090f" />
            <path d="M177 314q5-67 74-70 68-3 82 70m467 0q7-71 81-74 72-1 81 74" stroke="#06101a" strokeWidth="6" />
            <g clipPath={paint("body-clip")}>
              <path className={styles.reflection} d="m240 90 150-10 310 280-150 10Z" fill={paint("reflection")} />
            </g>
          </g>

          {[{ x: 252, y: 316 }, { x: 882, y: 314 }].map(({ x, y }) => <g key={x} transform={`translate(${x} ${y})`}>
            <circle r="65" fill="#060b11" stroke="#1d2934" strokeWidth="3" />
            <circle r="52" fill="#0b131c" stroke={paint("rim")} strokeWidth="3" />
            <circle r="44" fill="#19232e" stroke="#536575" strokeWidth="1" />
            <path d="m29-28 9 13-4 24-10-3Z" fill="#a73e39" />
            <g className={styles.spokes}>
              {[0, 60, 120, 180, 240, 300].map(angle => <path key={angle} transform={`rotate(${angle})`} d="m-5-7-9-38 7-2L5-10 15-44l5 3L9 6Z" fill={paint("rim")} />)}
              <circle r="12" fill="#657b8b" stroke="#a0b0bd" strokeWidth="1.5" />
              <circle r="5" fill="#1a2835" />
            </g>
            <path d="M-47-24a53 53 0 0 1 85-11" stroke="#c2d7e7" strokeOpacity=".4" strokeWidth="2" strokeLinecap="round" />
          </g>)}
        </svg>
      </div>
      <div className={styles.grain} />
    </div>
    <button type="button" className={styles.toggle} hidden={editing} data-preview-static="Background animation playback control" aria-label={paused ? "Play background animation" : "Pause background animation"} aria-pressed={paused} onClick={() => setPaused(value => !value)}>
      <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor" aria-hidden="true">
        {paused ? <path d="m6 4 10 6-10 6Z" /> : <path d="M5 4h3v12H5zm7 0h3v12h-3z" />}
      </svg>
    </button>
  </>;
}
