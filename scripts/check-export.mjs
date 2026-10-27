import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { withBrowser } from "./browser-session.mjs";

// Serve only files actually emitted by Next; no SPA fallback can mask a 404.
const root = path.resolve("out");
const data = JSON.parse(fs.readFileSync("src/data/site-data.json", "utf8"));
const vehicles = Object.keys(data.content.cards.vehicles);
const types = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".json": "application/json", ".jpg": "image/jpeg", ".png": "image/png", ".svg": "image/svg+xml", ".ico": "image/x-icon", ".woff2": "font/woff2", ".woff": "font/woff" };
const server = http.createServer((request, response) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname); } catch { response.writeHead(400).end(); return; }
  let file = path.resolve(root, "." + pathname);
  if (file !== root && !file.startsWith(root + path.sep)) { response.writeHead(403).end(); return; }
  // Next 16 emits RSC payload directories alongside route.html files.
  // A payload directory is not an index.html page.
  if (fs.existsSync(file) && fs.statSync(file).isDirectory() && fs.existsSync(path.join(file, "index.html"))) file = path.join(file, "index.html");
  else if (fs.existsSync(file + ".html")) file += ".html";
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) { response.writeHead(404).end(); return; }
  response.writeHead(200, { "Content-Type": types[path.extname(file)] || "application/octet-stream" });
  fs.createReadStream(file).pipe(response);
});
await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
const base = `http://127.0.0.1:${server.address().port}`;
try {
  await withBrowser(async ({ send, evaluate, navigate, screenshot, check, checks, exceptions, consoleErrors }) => {
    for (const [route, key] of [["/", "home"], ["/inventory", "inventory"], ["/about", "about"], ["/contact", "contact"], ...vehicles.map(id => [`/cars/${id}`, `car-${id}`])]) {
      check(`Static route ${route} returns its own HTML`, (await fetch(base + route)).status === 200);
      await navigate(base + route, key);
      check(`Production ${key} has one header/footer and no overflow`, await evaluate("document.querySelectorAll('.vm-header').length===1 && document.querySelectorAll('.vm-footer').length===1 && document.documentElement.scrollWidth<=innerWidth"));
    }
    check("Unknown routes do not silently serve the homepage", (await fetch(base + "/missing-page")).status === 404);
    check("Unknown vehicle routes return 404", (await fetch(base + "/cars/missing-vehicle")).status === 404);
    await send("Emulation.setScriptExecutionDisabled", { value: true });
    await navigate(base + "/inventory", "inventory");
    check("Exported Inventory contains all eight cards without JavaScript", await evaluate("document.querySelectorAll('.vm-vehicle-card').length===8 && document.querySelectorAll('.vm-vehicle-wrap:not([hidden])').length===8"));
    check("Inventory custom CSS and fonts load in the export", await evaluate("getComputedStyle(document.querySelector('.vm-inventory-layout')).display==='grid' && parseFloat(getComputedStyle(document.querySelector('.vm-inventory-title')).fontSize)>40"));
    check("No-JavaScript filter limitation is stated honestly", await evaluate("document.querySelector('noscript').textContent.includes('Enable JavaScript')"));
    await screenshot("inventory-production-no-js.png");
    await navigate(base, "home");
    check("Homepage hero remains readable without JavaScript", await evaluate("getComputedStyle(document.querySelector('.vm-hero-line')).opacity==='1' && document.querySelector('.vm-hero h1').textContent.includes('Beyond the ordinary')"));
    for (const id of vehicles) {
      await navigate(`${base}/cars/${id}`, `car-${id}`);
      check(`Exported ${id} keeps specifications, equipment, photography and inquiries without JavaScript`, await evaluate(`document.querySelector('.vm-car-title').textContent===${JSON.stringify(data.content.cards.vehicles[id].name)} && document.querySelectorAll('[data-spec]').length===8 && document.querySelectorAll('.vm-car-features li').length>0 && getComputedStyle(document.querySelector('.vm-gallery-slide.is-active')).opacity==='1' && document.querySelectorAll('.vm-gallery-no-js a').length===2 && document.querySelector('.vm-car-viewing').getAttribute('href').startsWith('mailto:') && document.querySelectorAll('.vm-related-grid .vm-vehicle-photo-link').length===3`));
    }
    check(`Production has no uncaught exceptions (${exceptions.join('; ')})`, exceptions.length===0);
    check(`Production has no console errors (${consoleErrors.join('; ')})`, consoleErrors.length===0);
    fs.writeFileSync(".qa/export-checks.json", JSON.stringify({ checks, exceptions, consoleErrors }, null, 2));
    console.log(`Verified ${checks.length} production checks.`);
  });
} finally {
  server.closeAllConnections();
  await new Promise(resolve => server.close(resolve));
}
