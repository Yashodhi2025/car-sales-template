import fs from "node:fs";
import { withBrowser } from "./browser-session.mjs";

const base = (process.argv[2] || "http://127.0.0.1:4173").replace(/\/$/, "");
const source = JSON.parse(fs.readFileSync("src/data/site-data.json", "utf8"));
const manifest = JSON.parse(fs.readFileSync("fivora-template.json", "utf8"));
await withBrowser(async ({ send, navigate, evaluate, value, until, check, screenshot, sleep, exceptions, consoleErrors }) => {
  await send("Page.bringToFront");
  const result = key => `document.querySelector('[data-loan-result="${key}"]')`;
  const amount = key => evaluate(`Number(${result(key)}.textContent.replace(/[^0-9.-]/g,''))`);
  const publish = async data => {
    await evaluate(`window.postMessage({type:'FIVORA_PREVIEW_SITE_DATA',siteData:${JSON.stringify(data)}},location.origin)`);
    await sleep(200);
  };
  for (const [id, card] of Object.entries(source.content.cards.vehicles)) {
    await navigate(`${base}/cars/${id}`, `car-${id}`);
    check(`${id}: calculator auto-fills the displayed vehicle price`, await evaluate(`document.querySelector('#loan-price').value.replaceAll(',','')===${JSON.stringify(card.price.replace(/[^0-9.]/g, ""))}`));
    check(`${id}: a finite monthly estimate is rendered`, Number.isFinite(await amount("monthly")) && await amount("monthly") > 0);
  }
  await navigate(`${base}/cars/porsche-panamera`, "car-porsche-panamera");
  const set = async (key, number) => value(`#loan-${key}`, String(number));
  check("Currency inputs show grouped amounts", await evaluate("document.querySelector('#loan-price').value==='69,500,000'"));
  await evaluate("document.querySelector('#loan-price').focus()");
  await until("document.querySelector('#loan-price').value==='69500000'");
  check("Currency input exposes the ungrouped value for precise editing", await evaluate("document.querySelector('#loan-price').value==='69500000'"));
  await evaluate("document.querySelector('#loan-price').blur()");
  await until("document.querySelector('#loan-price').value==='69,500,000'");
  check("Currency formatting returns after editing", await evaluate("document.querySelector('#loan-price').value==='69,500,000'"));
  await set("price", "15,000.50"); await set("downPayment", "5,000.25");
  check("Grouped decimal amounts keep their exact principal", await amount("principal") === 10000.25);
  await set("price", 15000); await set("downPayment", 5000); await set("annualRate", 12); await set("months", 12);
  check("Visitor inputs recalculate EMI and total interest accurately", await amount("monthly") === 888.49 && await amount("totalInterest") === 661.85 && await amount("principal") === 10000 && await amount("totalRepayment") === 10661.85);
  await set("annualRate", 0); await set("months", 10);
  check("Zero interest returns principal divided by the term", await amount("monthly") === 1000 && await amount("totalInterest") === 0);
  await set("downPayment", 15000);
  check("A full down payment returns zero EMI and zero interest", await amount("monthly") === 0 && await amount("totalInterest") === 0);
  for (const [key, invalid] of [["downPayment", 15001], ["annualRate", -1], ["months", 12.5], ["price", ""]]) {
    const previous = await evaluate(`document.querySelector('#loan-${key}').value`);
    await set(key, invalid);
    check(`Invalid ${key} hides estimates and exposes an associated error`, await evaluate(`document.querySelector('#loan-${key}').getAttribute('aria-invalid')==='true' && document.querySelector('#loan-${key}-error > p').hidden===false && ${result("monthly")}.textContent==='—'`));
    await set(key, previous);
  }
  await evaluate("document.querySelector('#vehicle-loan-calculator button[type=reset]').click()");
  check("Reset restores formatted vehicle price and saved defaults", await evaluate("document.querySelector('#loan-price').value==='69,500,000' && document.querySelector('#loan-downPayment').value==='13,900,000' && document.querySelector('#loan-annualRate').value==='8' && document.querySelector('#loan-months').value==='60'"));
  check("Inputs have accessible labels and results have a live status region", await evaluate("[...document.querySelectorAll('#vehicle-loan-calculator input')].every(el=>el.labels.length===1 && !!document.querySelector('#'+el.getAttribute('aria-describedby').split(' ')[0])) && !!document.querySelector('#vehicle-loan-calculator [role=status][aria-live=polite]')"));
  for (const width of [1440, 1024, 768, 390, 320]) {
    await send("Emulation.setDeviceMetricsOverride", { width, height: 950, deviceScaleFactor: 1, mobile: width < 600 });
    await evaluate("document.querySelector('#vehicle-loan-calculator').scrollIntoView({block:'start',behavior:'instant'})");
    await sleep(180);
    check(`Calculator fits ${width}px without overflow or clipped inputs`, await evaluate("document.documentElement.scrollWidth<=innerWidth && [...document.querySelectorAll('#vehicle-loan-calculator input')].every(el=>{const r=el.getBoundingClientRect();return r.left>=0 && r.right<=innerWidth && r.width>150})"));
    if (width === 1440 || width === 390) await screenshot(`loan-${width}.png`, width === 390);
  }
  const mounted = await evaluate("[...document.querySelectorAll('#vehicle-loan-calculator [data-preview-field-path]')].map(el=>el.dataset.previewFieldPath)");
  const leaves = [];
  const walk = (object, prefix) => { for (const [key, val] of Object.entries(object)) { const path = `${prefix}.${key}`; if (val && typeof val === "object") walk(val, path); else leaves.push(path); } };
  walk(source.content.loanCalculator, "loanCalculator");
  check("Every calculator field has a real editable target or explicit Fivora control", leaves.every(path => mounted.includes(path) || manifest.visualEditing.controlOnlyPaths.includes(path)));
  check("Fivora exposes numeric defaults on the Car Details Page", manifest.editorSchema.sections.some(section => section.path === "loanCalculator" && section.pageKey === "car-porsche-panamera" && section.fields.find(field => field.key === "defaults").fields.every(field => field.type === "number")));
  const edited = structuredClone(source);
  edited.content.cards.vehicles["porsche-panamera"].price = "LKR 100,000";
  edited.content.loanCalculator.title = "Your monthly payment";
  edited.content.loanCalculator.defaults = { downPaymentPercent: 10, annualRate: 0, months: 10 };
  edited.content.loanCalculator.fields.months.label = "Repayment period";
  edited.content.common.currencyCode = "GBP";
  edited.styles = { "loanCalculator.title": { color: "#006644" } };
  await publish(edited);
  await until("document.querySelector('#loan-price').value==='100,000'");
  check("Live Fivora messages update price, defaults, labels, currency and estimates", await evaluate("document.querySelector('#loan-calculator-title').textContent==='Your monthly payment' && document.querySelector('label[for=loan-months]').textContent==='Repayment period' && document.querySelector('#loan-downPayment').value==='10,000' && document.querySelector('#loan-annualRate').value==='0' && document.querySelector('#loan-months').value==='10'") && await amount("monthly") === 9000 && await evaluate(`${result("monthly")}.textContent.includes('GBP')`));
  check("Fivora typography styles apply to calculator copy", await evaluate("getComputedStyle(document.querySelector('[data-preview-field-path=\"loanCalculator.title\"]')).color==='rgb(0, 102, 68)'"));
  edited.content.loanCalculator.title = "";
  edited.content.loanCalculator.defaults.annualRate = 0;
  edited.content.cards.vehicles["porsche-panamera"].price = "Price on application";
  await publish(edited);
  check("Missing prices do not fall back to stale catalogue values; empty copy stays editable", await evaluate("document.querySelector('#loan-price').value==='' && document.querySelector('#loan-price').getAttribute('aria-invalid')==='true' && !!document.querySelector('[data-preview-field-path=\"loanCalculator.title\"]') && document.querySelector('[data-loan-result=monthly]').textContent==='—'"));
  await set("price", 10000); await set("downPayment", 0);
  check("Visitors can still estimate when the vehicle has no published price", await amount("monthly") === 1000);
  await publish(source);
  await navigate(`${base}/cars/bmw-m5`, "car-bmw-m5");
  check("Changing vehicle resets the quote to that vehicle", await evaluate("document.querySelector('#loan-price').value==='59,500,000' && document.querySelector('#loan-annualRate').value==='8'"));
  check("Gallery, detail sections, enquiry and viewing remain available without the removed navigation bar", await evaluate("!!document.querySelector('.vm-gallery-stage') && !document.querySelector('.vm-car-section-nav') && document.querySelectorAll('[data-detail-section]').length===4 && !!document.querySelector('.vm-car-enquire[href*=contact]') && !!document.querySelector('.vm-viewing-form')"));
  check(`No browser exceptions or console errors (${exceptions.join('; ')} ${consoleErrors.join('; ')})`, exceptions.length === 0 && consoleErrors.length === 0);
});
