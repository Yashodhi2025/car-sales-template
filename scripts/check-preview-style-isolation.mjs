import fs from "node:fs";
import { createRequire } from "node:module";
import { withBrowser } from "./browser-session.mjs";

const require = createRequire(import.meta.url);
const bridge = require("../node_modules/@deneb-ui/cli/src/tools/template-preview-focus-bridge.cjs");
const data = JSON.parse(fs.readFileSync("src/data/site-data.json", "utf8"));
const baseUrl = process.argv[2] || "http://localhost:4180";

// Exercise the actual injected editor: provider-only style patches do not
// reproduce its first-edit activation of the generic global theme preset.
await withBrowser(async ({ send, navigate, evaluate, until, sleep, check, consoleErrors, exceptions }) => {
  // Reproduce the editor-owned attributes that previously caused hydration
  // warnings. This runs as HTML is parsed, before React hydrates each frame.
  await send("Page.addScriptToEvaluateOnNewDocument", { source: `(() => {
    window.__qaEditorMarkers=0;
    const mark=()=>document.querySelectorAll('[data-preview-field-path],[data-preview-list-path]').forEach(element=>{
      if(element.getAttribute('data-preview-control')==='icon-picker')return;
      const path=element.getAttribute('data-preview-field-path')||element.getAttribute('data-preview-list-path');
      if(path&&element.getAttribute('data-fivora-resolved-field-path')!==path){element.setAttribute('data-fivora-resolved-field-path',path);window.__qaEditorMarkers++;}
    });
    new MutationObserver(mark).observe(document,{childList:true,subtree:true});
  })()` });
  await navigate(`${baseUrl}/about`, "about");
  check("Editor metadata is injected during initial page loading", await evaluate("window.__qaEditorMarkers>0"));
  const frame = "document.querySelector('#style-preview')";
  const doc = `${frame}.contentDocument`;
  const win = `${frame}.contentWindow`;
  const patch = async (targetPath, styleType, properties) => {
    await evaluate(`${win}.postMessage(${JSON.stringify({ type: "FIVORA_PREVIEW_STYLE_PATCH", targetPath, fieldPath: targetPath, styleType, properties })},location.origin)`);
    await sleep(400);
  };
  const publish = async siteData => {
    await evaluate(`${win}.postMessage(${JSON.stringify({ type: "FIVORA_PREVIEW_SITE_DATA", siteData })},location.origin)`);
    await sleep(500);
  };
  const snapshot = () => evaluate(`(() => {
    const d=${doc};
    return Array.from(d.querySelectorAll('main,section,article,h1,h2,h3,p,a,button,input,[data-preview-field-path]')).map(e=>({
      path:e.getAttribute('data-preview-field-path'),
      color:d.defaultView.getComputedStyle(e).color,
      background:d.defaultView.getComputedStyle(e).backgroundColor
    }));
  })()`);
  const changed = (before, after) => after.filter((value, index) => before[index]?.color !== value.color || before[index]?.background !== value.background);
  const mount = async route => {
    await evaluate(`(() => {document.querySelector('#style-preview')?.remove();const f=document.createElement('iframe');f.id='style-preview';f.src=${JSON.stringify(baseUrl + route)};f.style.cssText='position:fixed;inset:0;width:100%;height:100%;z-index:99999;background:white';document.body.append(f)})()`);
    await until(`${doc}?.readyState==='complete' && !!${doc}?.querySelector('.vm-nav-cta')`);
    await sleep(1200);
    await evaluate(`${win}.eval(${JSON.stringify(bridge)})`);
    await publish(data);
  };

  for (const route of ["/", "/services", "/about", "/inventory", "/cars/bmw-m5", "/contact"]) {
    await mount(route);

    if (route === "/") {
      const nativeStyles = structuredClone(data);
      nativeStyles.styles = {
        "common.headerCtaLabel": { color: "#aa2255" },
        "common.headerCtaLink": { backgroundColor: "#224466" },
      };
      const original = await snapshot();
      await publish(nativeStyles);
      const nativeDifferences = changed(original, await snapshot());
      check("Saved component styles stay local to the navbar action", nativeDifferences.length > 0 && nativeDifferences.every(value => ["common.headerCtaLabel", "common.headerCtaLink"].includes(value.path)));
      check("Saved navbar background is rendered", await evaluate(`getComputedStyle(${doc}.querySelector('.vm-nav-cta')).backgroundColor==='rgb(34, 68, 102)'`));
      // Start the live-edit case in a fresh document, independently of the
      // bridge's cached DOM patches from the saved-component-style case.
      await mount(route);

      const controlBefore = await snapshot();
      await evaluate(`(() => {const style=${doc}.createElement('style');style.id='qa-global-colour-probe';style.textContent='main h1,main h2,main p{color:#dc2288!important}';${doc}.head.append(style)})()`);
      check("Colour check detects unintended global recolouring", changed(controlBefore, await snapshot()).some(value => value.path && value.path !== "home.hero.title"));
      await evaluate(`${doc}.querySelector('#qa-global-colour-probe').remove()`);
    }

    const headingPath = await evaluate(`${doc}.querySelector('h1[data-preview-style-type="text"],h1 [data-preview-style-type="text"]').getAttribute('data-preview-field-path')`);
    let before = await snapshot();
    await patch(headingPath, "text", { color: "#ee22aa" });
    let differences = changed(before, await snapshot());
    check(`${route}: first heading edit leaves other colours intact`, differences.length > 0 && differences.every(value => value.path === headingPath));

    before = await snapshot();
    await patch("common.headerCtaLabel", "text", { color: "#1177cc" });
    differences = changed(before, await snapshot());
    check(`${route}: navbar text colour is isolated`, differences.length > 0 && differences.every(value => value.path === "common.headerCtaLabel"));

    before = await snapshot();
    await patch("common.headerCtaLink", "button", { backgroundColor: "#884422" });
    differences = changed(before, await snapshot());
    check(`${route}: navbar background does not recolour other buttons or cards`, differences.length > 0 && differences.every(value => value.path === "common.headerCtaLink"));
    check(`${route}: navbar action exposes its own button style target`, await evaluate(`${doc}.querySelector('.vm-nav-cta').getAttribute('data-preview-style-target')==='common.headerCtaLink'&&${doc}.querySelector('.vm-nav-cta').getAttribute('data-preview-style-type')==='button'`));

    const saved = structuredClone(data);
    saved.template.structure.theme.elementStyles = {
      [headingPath]: { color: "#ee22aa" },
      "common.headerCtaLabel": { color: "#1177cc" },
      "common.headerCtaLink": { backgroundColor: "#884422" },
    };
    before = await snapshot();
    await publish(saved);
    differences = changed(before, await snapshot());
    if (differences.length) console.log("SAVED_DIFF", route, differences.slice(0, 8));
    check(`${route}: reapplying saved element overrides preserves all colours`, differences.length === 0);

    if (route === "/services") {
      const sectionId = await evaluate(`${doc}.querySelector('main section[id]').id`);
      saved.template.structure.theme.sections = { [sectionId]: { backgroundColor: "#334455", headingColor: "#ccddee", textAlign: "left", gridColumns: "3" } };
      await publish(saved);
      check("Explicit section customisation still applies", await evaluate(`getComputedStyle(${doc}.getElementById(${JSON.stringify(sectionId)})).backgroundColor==='rgb(51, 68, 85)'`));
      delete saved.template.structure.theme.sections;
      saved.template.structure.theme.elementStyles["site:all"] = { color: "#335577" };
      await publish(saved);
      check("Explicit whole-website scope is retained", await evaluate(`getComputedStyle(${doc}.body).color==='rgb(51, 85, 119)'`));
      delete saved.template.structure.theme.elementStyles["site:all"];
      saved.template.structure.theme.headingColor = "#225566";
      await publish(saved);
      check("Intentional global theme settings remain available", await evaluate(`getComputedStyle(${doc}.querySelector('h2')).color==='rgb(34, 85, 102)'`));
    }
  }
  check("No browser errors", consoleErrors.length === 0 && exceptions.length === 0);
});
