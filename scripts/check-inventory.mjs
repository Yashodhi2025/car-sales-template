import fs from "node:fs";
import { withBrowser } from "./browser-session.mjs";

const base = (process.argv[2] || "http://127.0.0.1:4173").replace(/\/$/, "");
await withBrowser(async ({ send, evaluate, navigate, until, screenshot, value, check, sleep, checks, exceptions, consoleErrors }) => {
  const visibleIds = "[...document.querySelectorAll('.vm-inventory-grid .vm-vehicle-wrap:not([hidden]) .vm-vehicle-card')].map(el=>el.dataset.previewItemPath.replace('cards.vehicles.',''))";
  const reset = async () => { await evaluate("document.querySelector('.vm-inventory-reset').click()"); await sleep(120); };
  if (!process.argv.includes("--lab-only")) {
    await navigate(`${base}/inventory`, "inventory");
    check("Inventory renders eight real Deneb cards", await evaluate("document.querySelectorAll('.vm-vehicle-card').length===8"));
    check("Inventory and shared navigation CSS applies", await evaluate("getComputedStyle(document.querySelector('.vm-header')).position==='sticky' && getComputedStyle(document.querySelector('.vm-inventory-layout')).display==='grid' && parseFloat(getComputedStyle(document.querySelector('.vm-inventory-title')).fontSize)>40"));
    check("Real page links replace homepage scroll navigation", await evaluate("['/','/inventory','/about','/contact'].every(route=>[...document.querySelectorAll('.vm-desktop-nav a')].some(a=>a.getAttribute('href')===route))"));
    await evaluate("Promise.all([...document.querySelectorAll('.vanguard img')].map(img=>{img.loading='eager';return img.decode().catch(()=>null)}))");
    check("Every vehicle photo loads locally", await evaluate("[...document.querySelectorAll('.vm-vehicle-image')].every(img=>img.complete&&img.naturalWidth>0)"));
    await screenshot("inventory-desktop.png");
    await screenshot("inventory-desktop-full.png", true);
    for (const width of [1440, 1024, 768, 390, 320]) {
      await send("Emulation.setDeviceMetricsOverride", { width, height: 950, deviceScaleFactor: 1, mobile: width < 600 });
      await sleep(150);
      check(`Inventory has no horizontal overflow at ${width}px`, await evaluate("document.documentElement.scrollWidth<=innerWidth"));
      check(`SVGs stay bounded at ${width}px`, await evaluate("[...document.querySelectorAll('.vanguard svg')].every(el=>{const r=el.getBoundingClientRect();return r.width<=32&&r.height<=32})"));
      if (width===390) { await screenshot("inventory-mobile.png"); await screenshot("inventory-mobile-full.png", true); }
    }
    await evaluate("document.querySelector('.vm-filter-panel').open=false; document.querySelector('.vm-filter-panel summary').click()");
    check("Mobile filters open with native disclosure", await evaluate("document.querySelector('.vm-filter-panel').open"));
    await value('select[name="brand"]', "tesla");
    check("Brand filter updates cards, count, chips and URL", await evaluate(`${visibleIds}.join(',')==='tesla-model-3' && document.querySelector('.vm-inventory-count strong').textContent==='1' && location.search.includes('brand=tesla') && document.querySelector('.vm-active-filters').textContent.includes('Tesla')`));
    await value('select[name="bodyType"]', "coupe");
    check("Combined conflicting filters show the empty state", await evaluate(`${visibleIds}.length===0 && !document.querySelector('.vm-empty-results').hidden`));
    await reset();
    await value('select[name="fuel"]', "Diesel");
    check("Fuel filtering works", await evaluate(`${visibleIds}.join(',')==='honda-crv'`));
    await reset();
    await value('select[name="transmission"]', "Manual");
    await value('input[name="minPrice"]', "40000");
    await value('input[name="maxPrice"]', "45000");
    check("Transmission and numeric budget filters combine", await evaluate(`${visibleIds}.join(',')==='chevrolet-camaro'`));
    await value('input[name="minPrice"]', "90000");
    check("Invalid budgets show a readable validation message", await evaluate("!document.querySelector('#inventory-price-error').hidden && document.querySelector('input[name=minPrice]').getAttribute('aria-invalid')==='true'"));
    await reset();
    await value('input[name="q"]', "porsche turbo");
    check("Keyword search matches multiple words", await evaluate(`${visibleIds}.join(',')==='porsche-panamera'`));
    await value('input[name="q"]', "not a real vehicle");
    check("Keyword empty results are honest", await evaluate(`${visibleIds}.length===0 && !document.querySelector('.vm-empty-results').hidden`));
    await reset();
    await value('select[name="availability"]', "Reserved");
    check("Availability filter distinguishes reserved vehicles", await evaluate(`${visibleIds}.join(',')==='ferrari-458'`));
    await reset();
    for (const [sort, first] of [["price-low","honda-crv"],["price-high","ferrari-458"],["newest","tesla-model-3"],["oldest","ferrari-458"],["mileage","ferrari-458"]]) {
      await value('select[name="sort"]', sort);
      check(`Sorting ${sort} uses the correct vehicle`, await evaluate(`${visibleIds}[0]===${JSON.stringify(first)}`));
    }
    await reset();
    check("Reset restores all stock and the clean route", await evaluate(`${visibleIds}.length===8 && location.search==='' && document.querySelector('select[name=sort]').value==='featured'`));
    await navigate(`${base}/inventory?brand=bmw&minPrice=40000&sort=price-low`, "inventory");
    check("Shared inventory URLs restore filter state", await evaluate(`${visibleIds}.join(',')==='bmw-m5' && document.querySelector('select[name=brand]').value==='bmw' && document.querySelector('input[name=minPrice]').value==='40000'`));
    await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
    await evaluate("document.querySelector('.vm-vehicle-action').click()");
    await until("!!document.querySelector('[data-preview-page-key=contact]') && !!document.querySelector('.vm-selected-vehicle p')?.textContent");
    check("Vehicle inquiry goes to the real Contact route with context", await evaluate("location.pathname==='/contact' && document.querySelector('.vm-selected-vehicle').textContent.includes('BMW M5')"));
    await evaluate("document.querySelector('.vm-desktop-nav a[href=\"/about\"]').click()");
    await until("!!document.querySelector('[data-preview-page-key=about]')");
    check("About route reuses the dealership content and shared chrome", await evaluate("document.querySelectorAll('.vm-benefits article').length===4 && document.querySelectorAll('.vm-header').length===1 && document.querySelectorAll('.vm-footer').length===1"));
    await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
    check("Page entrance respects reduced motion", await evaluate("getComputedStyle(document.querySelector('.vm-page')).animationName==='none'"));
    await send("Emulation.setEmulatedMedia", { features: [] });
  }

  if (process.argv.includes("--lab")) {
    const data = JSON.parse(fs.readFileSync("src/data/site-data.json", "utf8"));
    const manifest = JSON.parse(fs.readFileSync("fivora-template.json", "utf8"));
    const mounted = new Set();
    for (const route of ["/", "/inventory", "/about", "/contact"]) {
      await send("Page.navigate", { url: "http://127.0.0.1:4174/__fivora_local_preview" });
      await until("document.querySelector('iframe')?.contentDocument?.documentElement.getAttribute('data-gramm')==='false'");
      if (route!=="/") {
        await evaluate(`document.querySelector('iframe').src=${JSON.stringify(route)}`);
        await until(`!!document.querySelector('iframe')?.contentDocument?.querySelector('[data-preview-page-key="${route.slice(1)}"]') && document.querySelector('iframe')?.contentDocument?.documentElement.getAttribute('data-gramm')==='false'`);
      }
      const paths = await evaluate("[...document.querySelector('iframe').contentDocument.querySelectorAll('[data-preview-field-path]')].map(el=>el.dataset.previewFieldPath)");
      paths.forEach(path=>mounted.add(path));
    }
    const leaves=[];
    const walk=(obj,prefix="")=>{for(const [key,value]of Object.entries(obj)){const p=prefix?`${prefix}.${key}`:key;if(value&&typeof value==='object')walk(value,p);else leaves.push(p)}};
    walk(data.content);
    const expected = leaves.filter(path=>!manifest.visualEditing.controlOnlyPaths.includes(path) && !path.startsWith("vehicles.") && !path.startsWith("vehicleDetails.") && !/^photos\.vehicles\.[^.]+\.(caption|gallery)(\.|$)/.test(path));
    const missing = expected.filter(path=>!mounted.has(path));
    check(`All ${expected.length} editable fields are mounted across the four routes (${missing.join(', ')})`, missing.length===0);
    await evaluate("document.querySelector('iframe').src='/inventory'");
    await until("!!document.querySelector('iframe')?.contentDocument?.querySelector('[data-preview-page-key=inventory]') && document.querySelector('iframe')?.contentDocument?.documentElement.getAttribute('data-gramm')==='false'");
    await evaluate("window.__selected=[];window.addEventListener('message',e=>{if(e.data?.type==='FIVORA_PREVIEW_ELEMENT_CLICKED')window.__selected.push(e.data)});document.querySelector('iframe').contentWindow.postMessage({type:'FIVORA_PREVIEW_EDIT_MODE',editMode:true},location.origin)");
    await sleep(150);
    await evaluate("document.querySelector('iframe').contentDocument.querySelector('[data-preview-field-path=\"cards.vehicles.bmw-m5.price\"]').click()");
    await sleep(100);
    check("Inventory price selection reaches Deneb Lab", await evaluate("window.__selected.length>0"));
    const edited = structuredClone(data);
    edited.content.inventory.hero.title = "Your next live edit.";
    edited.content.inventory.hero.image = "/images/tesla.jpg";
    edited.content.cards.vehicles["bmw-m5"].price = "GBP 10,000";
    edited.content.cards.vehicles["bmw-m5"].transmission = "Manual";
    edited.content.cards.vehicles["bmw-m5"].enquiryLink = "/contact?vehicle=bmw-m5&source=lab";
    edited.styles = { "inventory.hero.title": { color: "#00ffcc" }, "cards.vehicles.bmw-m5.price": { color: "#00ffcc" } };
    await evaluate(`document.querySelector('iframe').contentWindow.postMessage({type:'FIVORA_PREVIEW_SITE_DATA',siteData:${JSON.stringify(edited)}},location.origin)`);
    await sleep(350);
    check("Lab updates Inventory text, images, prices, specs and links", await evaluate("(()=>{const d=document.querySelector('iframe').contentDocument;const q=p=>d.querySelector('[data-preview-field-path=\"'+p+'\"]');return q('inventory.hero.title').textContent==='Your next live edit.' && q('inventory.hero.image').getAttribute('src').endsWith('tesla.jpg') && q('cards.vehicles.bmw-m5.price').textContent==='GBP 10,000' && q('cards.vehicles.bmw-m5.transmission').textContent.includes('Manual') && q('cards.vehicles.bmw-m5.enquiryLink').closest('a').getAttribute('href').includes('source=lab')})()"));
    check("Saved styles apply to Inventory and legacy cards", await evaluate("(()=>{const w=document.querySelector('iframe').contentWindow;return ['inventory.hero.title','cards.vehicles.bmw-m5.price'].every(p=>w.getComputedStyle(w.document.querySelector('[data-preview-field-path=\"'+p+'\"]')).color==='rgb(0, 255, 204)')})()"));
    await evaluate("document.querySelector('iframe').contentWindow.postMessage({type:'FIVORA_PREVIEW_EDIT_MODE',editMode:false},location.origin)");
    await value('input[name="maxPrice"]', "15000", "document.querySelector('iframe').contentDocument");
    check("Live edited prices affect the actual budget filter", await evaluate("document.querySelector('iframe').contentDocument.querySelectorAll('.vm-inventory-grid .vm-vehicle-wrap:not([hidden])').length===1"));
    edited.content.cards.vehicles["bmw-m5"].price = "";
    edited.content.cards.vehicles["bmw-m5"].mileage = 0;
    edited.content.cards.vehicles["bmw-m5"].badge = false;
    edited.content.inventory.hero.title = "";
    await evaluate(`document.querySelector('iframe').contentWindow.postMessage({type:'FIVORA_PREVIEW_SITE_DATA',siteData:${JSON.stringify(edited)}},location.origin)`);
    await sleep(250);
    check("Empty, zero and false editable fields stay mounted", await evaluate("(()=>{const d=document.querySelector('iframe').contentDocument;return ['inventory.hero.title','cards.vehicles.bmw-m5.price','cards.vehicles.bmw-m5.mileage','cards.vehicles.bmw-m5.badge','cards.vehicles.bmw-m5.specs.mileage.icon'].every(p=>d.querySelector('[data-preview-field-path=\"'+p+'\"]'))})()"));
    edited.requirements.requiredPages = ["home", "inventory", "contact"];
    await evaluate(`document.querySelector('iframe').contentWindow.postMessage({type:'FIVORA_PREVIEW_SITE_DATA',siteData:${JSON.stringify(edited)}},location.origin)`);
    await sleep(150);
    check("Navigation respects requiredPages in live data", await evaluate("![...document.querySelector('iframe').contentDocument.querySelectorAll('.vm-desktop-nav a')].some(a=>a.getAttribute('href')==='/about')"));
    await evaluate(`document.querySelector('iframe').contentWindow.postMessage({type:'FIVORA_PREVIEW_SITE_DATA',siteData:${JSON.stringify(data)}},location.origin)`);
  }
  check(`No uncaught browser exceptions (${exceptions.join('; ')})`, exceptions.length===0);
  check(`No browser console errors (${consoleErrors.join('; ')})`, consoleErrors.length===0);
  fs.writeFileSync(".qa/inventory-checks.json", JSON.stringify({ base, checks, exceptions, consoleErrors }, null, 2));
  console.log(`Verified ${checks.length} browser checks.`);
});
