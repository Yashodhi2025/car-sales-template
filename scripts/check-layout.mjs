import fs from "node:fs";
import { withBrowser } from "./browser-session.mjs";

const data = JSON.parse(fs.readFileSync("src/data/site-data.json", "utf8"));
const baseUrl = (process.argv[2] || "http://localhost:4180").replace(/\/$/, "");
const routes = [
  ["/", "home"], ["/inventory", "inventory"], ["/services", "services"],
  ["/about", "about"], ["/contact", "contact"],
  ...Object.keys(data.content.vehicles).map(id => [`/cars/${id}`, `car-${id}`]),
].filter(([, key]) => data.requirements.requiredPages.includes(key));

await withBrowser(async ({ send, navigate, evaluate, until, sleep, check, consoleErrors, exceptions }) => {
  for (const [route, key] of routes) {
    await navigate(baseUrl + route, key);
    await evaluate("document.querySelectorAll('main img').forEach(image=>{image.loading='eager'})");
    await until("Array.from(document.querySelectorAll('main img')).every(image=>image.complete&&image.naturalWidth>0)");
    check(`${key}: one visible page title, header and footer`, await evaluate(`(() => {
      const title=document.querySelector('main h1'),rect=title?.getBoundingClientRect();
      return document.querySelectorAll('main h1').length===1&&rect.width>0&&rect.height>0&&document.querySelectorAll('.vm-header').length===1&&document.querySelectorAll('.vm-footer').length===1;
    })()`));

    for (const width of [1440, 1024, 768, 390, 320]) {
      await send("Emulation.setDeviceMetricsOverride", { width, height: 1000, deviceScaleFactor: 1, mobile: width < 600 });
      await sleep(130);
      // Resizing can reveal cards and start staggered entrances. Measure the
      // finished layout; leave the site's animations enabled and unchanged.
      await evaluate("Promise.all(document.getAnimations().filter(animation=>animation.playState==='running'&&Number.isFinite(animation.effect?.getComputedTiming().endTime)).map(animation=>animation.finished.catch(()=>{})))");
      check(`${key}: no horizontal overflow at ${width}px`, await evaluate("document.documentElement.scrollWidth<=innerWidth"));
      check(`${key}: form fields fit without overlapping at ${width}px`, await evaluate(`(() => {
        const fields=Array.from(document.querySelectorAll('form input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"]),form select,form textarea'))
          .map(node=>({node,rect:node.getBoundingClientRect()})).filter(item=>item.rect.width&&item.rect.height);
        return fields.every(({rect})=>rect.left>=-.5&&rect.right<=innerWidth+.5)&&fields.every((item,index)=>fields.slice(index+1).every(other=>
          item.node.closest('form')!==other.node.closest('form')||Math.min(item.rect.right,other.rect.right)-Math.max(item.rect.left,other.rect.left)<=1||Math.min(item.rect.bottom,other.rect.bottom)-Math.max(item.rect.top,other.rect.top)<=1));
      })()`));
      if (key === "services") check(`Services cards align within each row at ${width}px`, await evaluate(`(() => {
        const rows=new Map();for(const card of document.querySelectorAll('#services-grid > article')){const rect=card.getBoundingClientRect(),row=Math.round(rect.top);rows.set(row,[...(rows.get(row)||[]),rect.height]);}
        return rows.size>0&&Array.from(rows.values()).every(heights=>Math.max(...heights)-Math.min(...heights)<2);
      })()`));
      if (key.startsWith("car-") && width === 1440) check(`${key}: eight specification cards stay in one row`, await evaluate(`(() => {
        const cards=Array.from(document.querySelectorAll('.vm-car-spec-grid:not(.vm-car-finish-grid) > div')).map(card=>card.getBoundingClientRect());
        return cards.length===8&&cards.every(card=>Math.abs(card.top-cards[0].top)<1);
      })()`));
    }
  }
  check("No layout-check browser errors", consoleErrors.length === 0 && exceptions.length === 0);
});
