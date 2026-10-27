import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import assert from "node:assert/strict";

/** Shared zero-dependency Chromium/CDP harness for the template's browser checks. */
export async function withBrowser(task) {
  const output = path.resolve(".qa");
  fs.mkdirSync(output, { recursive: true });
  const executable = [process.env.QA_BROWSER, "C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"]
    .filter(Boolean).find(file => fs.existsSync(file));
  assert(executable, "Set QA_BROWSER to an installed Chrome/Edge executable.");
  const browser = spawn(executable, ["--headless=new", "--disable-gpu", "--no-first-run", "--disable-extensions", "--hide-scrollbars", "--remote-debugging-port=9237", `--user-data-dir=${path.join(output, "browser-profile-stage2")}`, "about:blank"], { stdio: "ignore", windowsHide: true });
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
  const pending = new Map();
  const checks = [], exceptions = [], consoleErrors = [];
  let ws, sequence = 0;
  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = ++sequence;
      const timer = setTimeout(() => { pending.delete(id); reject(new Error(`CDP timeout: ${method}`)); }, 25000);
      pending.set(id, { resolve: value => { clearTimeout(timer); resolve(value); }, reject: error => { clearTimeout(timer); reject(error); } });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }
  async function evaluate(expression) {
    const result = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
    return result.result?.value;
  }
  async function until(expression, timeout = 12000) {
    const end = Date.now() + timeout;
    while (Date.now() < end) {
      try { if (await evaluate(expression)) return; } catch {}
      await sleep(100);
    }
    throw new Error(`Condition not reached: ${expression}`);
  }
  async function navigate(url, pageKey) {
    await send("Page.navigate", { url });
    await until(`document.readyState==='complete' && !!document.querySelector(${JSON.stringify(pageKey ? `[data-preview-page-key="${pageKey}"]` : ".vanguard")})`, 20000);
    await evaluate("document.fonts.ready");
    await sleep(1100);
  }
  async function screenshot(name, full = false) {
    const metrics = await send("Page.getLayoutMetrics");
    const result = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: full,
      ...(full ? { clip: { x: 0, y: 0, width: metrics.cssContentSize.width, height: metrics.cssContentSize.height, scale: 1 } } : {}) });
    fs.writeFileSync(path.join(output, name), Buffer.from(result.data, "base64"));
  }
  async function value(selector, text, documentExpression = "document") {
    await evaluate(`(() => { const el=${documentExpression}.querySelector(${JSON.stringify(selector)});if(!el)throw new Error('Missing control');const win=el.ownerDocument.defaultView; const proto=el.tagName==='SELECT'?win.HTMLSelectElement.prototype:win.HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(proto,'value').set.call(el,${JSON.stringify(text)});el.dispatchEvent(new win.Event(el.tagName==='SELECT'?'change':'input',{bubbles:true}));})()`);
    await sleep(120);
  }
  function check(name, result) { assert(result, name); checks.push(name); console.log(`PASS ${name}`); }
  try {
    let tabs;
    for (let i = 0; i < 80; i++) {
      try { tabs = await (await fetch("http://127.0.0.1:9237/json")).json(); if (tabs.length) break; } catch {}
      await sleep(150);
    }
    assert(tabs?.length, "Chromium debugging did not become ready.");
    ws = new WebSocket(tabs.find(tab => tab.type === "page").webSocketDebuggerUrl);
    await new Promise((resolve, reject) => { ws.addEventListener("open", resolve, { once: true }); ws.addEventListener("error", reject, { once: true }); });
    ws.addEventListener("message", event => {
      const message = JSON.parse(event.data);
      if (message.method === "Runtime.exceptionThrown") exceptions.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text);
      if (message.method === "Runtime.consoleAPICalled" && message.params.type === "error") consoleErrors.push(message.params.args.map(arg => arg.value || arg.description || "").join(" "));
      const request = pending.get(message.id);
      if (request) { pending.delete(message.id); message.error ? request.reject(new Error(message.error.message)) : request.resolve(message.result); }
    });
    await send("Page.enable");
    await send("Runtime.enable");
    await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
    await task({ send, evaluate, navigate, until, screenshot, value, check, sleep, checks, exceptions, consoleErrors });
  } finally {
    if (ws?.readyState === WebSocket.OPEN) { try { await send("Browser.close"); } catch {} ws.close(); }
    browser.kill();
  }
}
