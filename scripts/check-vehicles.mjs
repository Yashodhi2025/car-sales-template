import fs from "node:fs";
import { withBrowser } from "./browser-session.mjs";

const base = (process.argv[2] || "http://127.0.0.1:4173").replace(/\/$/, "");
const data = JSON.parse(fs.readFileSync("src/data/site-data.json", "utf8"));
const manifest = JSON.parse(fs.readFileSync("fivora-template.json", "utf8"));
const ids = Object.keys(data.content.vehicles);
await withBrowser(async ({ send, evaluate, navigate, until, screenshot, check, sleep, checks, exceptions, consoleErrors }) => {
  const key = async (name, modifiers = 0) => {
    await send("Input.dispatchKeyEvent", { type: "keyDown", key: name, code: name, modifiers });
    await send("Input.dispatchKeyEvent", { type: "keyUp", key: name, code: name, modifiers });
    await sleep(120);
  };
  if (!process.argv.includes("--lab-only")) {
    for (const id of ids) {
      await navigate(`${base}/cars/${id}`, `car-${id}`);
      check(`${id}: direct route, name, price and specification render`, await evaluate(`document.querySelector('.vm-car-title').textContent===${JSON.stringify(data.content.cards.vehicles[id].name)} && document.querySelector('.vm-car-intro-price').textContent.includes(${JSON.stringify(data.content.cards.vehicles[id].price)}) && document.querySelectorAll('.vm-car-spec-grid > div').length===10`));
      await evaluate("Promise.all([...document.querySelectorAll('.vm-car-gallery img')].map(i=>{i.loading='eager';return i.decode().catch(()=>null)}))");
      check(`${id}: both gallery photos load and equipment stays editable`, await evaluate("document.querySelectorAll('.vm-gallery-slide').length>=2 && [...document.querySelectorAll('.vm-gallery-stage img')].every(i=>i.naturalWidth>0) && document.querySelectorAll('.vm-car-features [data-preview-field-path]').length>=2"));
      check(`${id}: power output is honestly unconfirmed`, await evaluate("document.querySelector('[data-spec=power] dd').textContent.includes('Confirm with our team')"));
      check(`${id}: viewing link opens its vehicle-specific request panel`, await evaluate(`document.querySelector('.vm-car-viewing').getAttribute('href')==='#request-viewing' && document.querySelector('.vm-viewing-vehicle').textContent.includes(${JSON.stringify(data.content.cards.vehicles[id].name)}) && !!document.querySelector('.vm-viewing-form input[type=date]')`));
      check(`${id}: related vehicles link to other working slugs`, await evaluate(`(()=>{const links=[...document.querySelectorAll('.vm-related-grid .vm-vehicle-photo-link')];return links.length===3&&links.every(a=>a.getAttribute('href').startsWith('/cars/')&&a.getAttribute('href')!==${JSON.stringify(`/cars/${id}`)})})()`));
    }
    check("Unknown vehicle slugs return 404", (await fetch(`${base}/cars/not-a-vehicle`)).status===404);
    await navigate(`${base}/cars/porsche-panamera`, "car-porsche-panamera");
    await screenshot("vehicle-desktop.png");
    await evaluate("Promise.all([...document.querySelectorAll('.vanguard img')].map(i=>{i.loading='eager';return i.decode().catch(()=>null)}))");
    await screenshot("vehicle-desktop-full.png", true);
    await evaluate("document.querySelector('.vm-gallery-controls button:last-child').click()");
    await until("document.querySelector('.vm-gallery-slide.is-active').dataset.photoIndex==='1'");
    check("Gallery next changes the active photograph", await evaluate("document.querySelectorAll('.vm-gallery-slide.is-active').length===1"));
    await evaluate("document.querySelector('.vm-gallery-controls button:last-child').click()");
    await until("document.querySelector('.vm-gallery-slide.is-active').dataset.photoIndex==='0'");
    check("Gallery wraps forward from its last photograph", true);
    await evaluate("document.querySelector('.vm-gallery-controls button:first-child').click()");
    await until("document.querySelector('.vm-gallery-slide.is-active').dataset.photoIndex==='1'");
    check("Gallery previous wraps to the last photograph", true);
    await evaluate("document.querySelector('.vm-gallery-thumbnails button:first-child').click()");
    await until("document.querySelector('.vm-gallery-slide.is-active').dataset.photoIndex==='0'");
    check("Thumbnails select a photograph with pressed state", await evaluate("document.querySelector('.vm-gallery-thumbnails button:first-child').getAttribute('aria-pressed')==='true'"));
    await evaluate("document.querySelector('.vm-gallery-controls button:first-child').focus()");
    await key("ArrowRight");
    check("Gallery keyboard arrows work", await evaluate("document.querySelector('.vm-gallery-slide.is-active').dataset.photoIndex==='1'"));
    await evaluate("const b=document.querySelector('.vm-gallery-enlarge');b.focus();b.click()");
    await until("!!document.querySelector('[role=dialog]') && document.activeElement.classList.contains('vm-viewer-close')");
    check("Viewer uses Deneb dialog, locks scrolling and makes the background inert", await evaluate("document.querySelector('[role=dialog]').classList.contains('deneb-dialog-portal') && document.querySelector('#site-top').inert && document.body.style.overflow==='hidden'"));
    await key("Tab", 8);
    check("Shift-Tab stays trapped inside the image viewer", await evaluate("document.activeElement.classList.contains('vm-viewer-next')"));
    await key("Tab");
    check("Tab wraps back to the viewer close button", await evaluate("document.activeElement.classList.contains('vm-viewer-close')"));
    await key("ArrowLeft");
    check("Viewer keyboard arrows update the photograph", await evaluate("document.querySelector('.vm-gallery-slide.is-active').dataset.photoIndex==='0'"));
    await screenshot("vehicle-viewer.png");
    await key("Escape");
    await until("!document.querySelector('[role=dialog]')");
    check("Escape closes the viewer and restores focus and background", await evaluate("!document.querySelector('#site-top').inert && document.activeElement.classList.contains('vm-gallery-enlarge') && document.body.style.overflow!=='hidden'"));
    for (const width of [1440,1024,768,390,320]) {
      await send("Emulation.setDeviceMetricsOverride", { width, height: 950, deviceScaleFactor: 1, mobile: width<600 });
      await sleep(120);
      check(`Vehicle layout stays within ${width}px`, await evaluate("document.documentElement.scrollWidth<=innerWidth"));
      check(`Vehicle SVGs remain bounded at ${width}px`, await evaluate("[...document.querySelectorAll('.vanguard svg')].every(s=>{const r=s.getBoundingClientRect();return r.width<=32&&r.height<=32})"));
      if(width===390){ await evaluate("window.scrollTo(0,0)"); await screenshot("vehicle-mobile.png"); await screenshot("vehicle-mobile-full.png",true); }
    }
    await evaluate("document.querySelector('.vm-gallery-enlarge').click()");
    await until("!!document.querySelector('[role=dialog]')");
    check("Mobile viewer fits its viewport", await evaluate("(()=>{const r=document.querySelector('.deneb-dialog-content').getBoundingClientRect();return r.width<=innerWidth&&r.height<=innerHeight})()"));
    await evaluate("document.querySelector('.deneb-dialog-backdrop').click()");
    await until("!document.querySelector('[role=dialog]')");
    check("Viewer backdrop closes the enlarged photo", true);
    await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
    check("Vehicle motion respects reduced-motion preferences", await evaluate("getComputedStyle(document.querySelector('.vm-gallery-slide img')).animationName==='none' && getComputedStyle(document.querySelector('.vm-page')).animationName==='none'"));
    await send("Emulation.setEmulatedMedia", { features: [] });
    await evaluate("document.querySelector('.vm-car-enquire').click()");
    await until("!!document.querySelector('[data-preview-page-key=contact]') && document.querySelector('.vm-selected-vehicle')?.textContent.includes('Porsche Panamera')");
    check("Vehicle inquiry preserves context on Contact", true);
    await navigate(`${base}/inventory`, "inventory");
    check("All eight Inventory photo and title links lead to vehicle routes", await evaluate("document.querySelectorAll('.vm-vehicle-photo-link').length===8&&[...document.querySelectorAll('.vm-vehicle-card > div > a[data-preview-field-path$=\".name\"]')].every(a=>a.getAttribute('href').startsWith('/cars/'))"));
    await evaluate("document.querySelector('.vm-vehicle-photo-link').click()");
    await until("!!document.querySelector('[data-preview-page-key=car-porsche-panamera]')");
    check("Inventory photography opens the real detail page", true);
    const destination=await evaluate("document.querySelector('.vm-related-grid .vm-vehicle-photo-link').getAttribute('href')");
    await evaluate("document.querySelector('.vm-related-grid .vm-vehicle-photo-link').click()");
    await until(`location.pathname===${JSON.stringify(destination)} && !!document.querySelector('.vm-car-gallery')`);
    check("Related vehicle navigation opens another detail page", true);
  }

  if(process.argv.includes("--lab")){
    const mounted=new Set();
    for(const page of manifest.pages){
      await send("Page.navigate",{url:"http://127.0.0.1:4174/__fivora_local_preview"});
      await until("document.querySelector('iframe')?.contentDocument?.documentElement.getAttribute('data-gramm')==='false'");
      if(page.route!=="/"){
        await evaluate(`document.querySelector('iframe').src=${JSON.stringify(page.route)}`);
        await until(`!!document.querySelector('iframe')?.contentDocument?.querySelector('[data-preview-page-key="${page.id}"]') && document.querySelector('iframe')?.contentDocument?.documentElement.getAttribute('data-gramm')==='false'`);
      }
      (await evaluate("[...document.querySelector('iframe').contentDocument.querySelectorAll('[data-preview-field-path]')].map(e=>e.dataset.previewFieldPath)")).forEach(p=>mounted.add(p));
    }
    const leaves=[];const walk=(o,p='')=>{for(const[k,v]of Object.entries(o)){const next=p?`${p}.${k}`:k;if(v&&typeof v==='object')walk(v,next);else leaves.push(next)}};walk(data.content);
    const expected=leaves.filter(p=>!manifest.visualEditing.controlOnlyPaths.includes(p));
    const missing=expected.filter(p=>!mounted.has(p));
    check(`All ${expected.length} source-backed editable fields mount across 12 routes (${missing.join(', ')})`,missing.length===0);
    await evaluate("document.querySelector('iframe').src='/cars/porsche-panamera'");
    await until("!!document.querySelector('iframe')?.contentDocument?.querySelector('[data-preview-page-key=car-porsche-panamera]') && document.querySelector('iframe')?.contentDocument?.documentElement.getAttribute('data-gramm')==='false'");
    await evaluate("window.__vehicleSelection=[];window.addEventListener('message',e=>{if(e.data?.type==='FIVORA_PREVIEW_ELEMENT_CLICKED')window.__vehicleSelection.push(e.data)});document.querySelector('iframe').contentWindow.postMessage({type:'FIVORA_PREVIEW_EDIT_MODE',editMode:true},location.origin)");await sleep(120);
    await evaluate("document.querySelector('iframe').contentDocument.querySelector('[data-preview-field-path=\"vehicles.porsche-panamera.engine\"]').click()");await sleep(100);
    check("Deneb Lab selects an actual vehicle specification",await evaluate("window.__vehicleSelection.length>0"));
    const edited=structuredClone(data);
    edited.content.cards.vehicles['porsche-panamera'].name='Edited Panamera';
    edited.content.cards.vehicles['porsche-panamera'].price='GBP 65,000';
    edited.content.vehicles['porsche-panamera'].description='A live editable vehicle description.';
    edited.content.vehicles['porsche-panamera'].engine='Live engine specification';
    edited.content.vehicles['porsche-panamera'].features[0].name='Live equipment entry';
    edited.content.vehicles['porsche-panamera'].viewingLink='mailto:hello@vanguardmotors.example?subject=Edited%20viewing';
    edited.content.photos.vehicles['porsche-panamera'].gallery[0].image='/images/tesla.jpg';
    edited.content.photos.vehicles['porsche-panamera'].gallery[0].caption='Edited gallery caption';
    edited.styles={'vehicles.porsche-panamera.engine':{color:'#00ffcc'}};
    await evaluate(`document.querySelector('iframe').contentWindow.postMessage({type:'FIVORA_PREVIEW_SITE_DATA',siteData:${JSON.stringify(edited)}},location.origin)`);await sleep(350);
    check("Lab updates names, prices, descriptions, specifications, equipment, CTAs and gallery entries",await evaluate("(()=>{const d=document.querySelector('iframe').contentDocument;const q=p=>d.querySelector('[data-preview-field-path=\"'+p+'\"]');return d.querySelector('.vm-car-title').textContent==='Edited Panamera'&&d.querySelector('.vm-car-price').textContent==='GBP 65,000'&&q('vehicles.porsche-panamera.description').textContent==='A live editable vehicle description.'&&q('vehicles.porsche-panamera.engine').textContent==='Live engine specification'&&q('vehicles.porsche-panamera.features.0.name').textContent==='Live equipment entry'&&d.querySelector('.vm-car-viewing').getAttribute('href').includes('Edited%20viewing')&&q('photos.vehicles.porsche-panamera.gallery.0.image').getAttribute('src').endsWith('tesla.jpg')&&q('photos.vehicles.porsche-panamera.gallery.0.caption').textContent==='Edited gallery caption'})()"));
    check("Saved specification styles apply through Deneb",await evaluate("(()=>{const w=document.querySelector('iframe').contentWindow;return w.getComputedStyle(w.document.querySelector('[data-preview-field-path=\"vehicles.porsche-panamera.engine\"]')).color==='rgb(0, 255, 204)'})()"));
    edited.content.vehicles['porsche-panamera'].engine='';edited.content.vehicles['porsche-panamera'].power=0;edited.content.vehicles['porsche-panamera'].features[0].name='';
    edited.content.cards.vehicles['porsche-panamera'].price=0;
    edited.content.photos.vehicles['porsche-panamera'].gallery[0].image='';edited.content.photos.vehicles['porsche-panamera'].gallery[0].caption='';
    await evaluate(`document.querySelector('iframe').contentWindow.postMessage({type:'FIVORA_PREVIEW_SITE_DATA',siteData:${JSON.stringify(edited)}},location.origin)`);await sleep(250);
    check("Empty gallery/equipment/specification targets and zero values persist",await evaluate("(()=>{const d=document.querySelector('iframe').contentDocument;return ['vehicles.porsche-panamera.engine','vehicles.porsche-panamera.power','vehicles.porsche-panamera.features.0.name','photos.vehicles.porsche-panamera.gallery.0.image','photos.vehicles.porsche-panamera.gallery.0.caption'].every(p=>d.querySelector('[data-preview-field-path=\"'+p+'\"]'))&&d.querySelector('[data-spec=power] dd').textContent==='0'})()"));
    await evaluate(`document.querySelector('iframe').contentWindow.postMessage({type:'FIVORA_PREVIEW_SITE_DATA',siteData:${JSON.stringify(data)}},location.origin)`);
  }
  check(`No uncaught browser exceptions (${exceptions.join('; ')})`,exceptions.length===0);
  check(`No browser console errors (${consoleErrors.join('; ')})`,consoleErrors.length===0);
  fs.writeFileSync('.qa/vehicle-checks.json',JSON.stringify({base,checks,exceptions,consoleErrors},null,2));
  console.log(`Verified ${checks.length} vehicle browser checks.`);
});
