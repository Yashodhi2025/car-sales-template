import fs from "node:fs";
import net from "node:net";
import path from "node:path";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { setTimeout as delay } from "node:timers/promises";

const require = createRequire(import.meta.url);
const output = path.resolve(".cache/qa");
const dist = ".cache/next-ui-validation";
fs.mkdirSync(output, { recursive: true });
const reports = [];
let server;
let serverLog = "";
let serverError;
let serverExited = false;

async function freePort() {
  const probe = net.createServer();
  await new Promise((resolve, reject) => { probe.once("error", reject); probe.listen(0, "127.0.0.1", resolve); });
  const port = probe.address().port;
  await new Promise(resolve => probe.close(resolve));
  return port;
}

async function runCheck(file, url) {
  console.log(`\nBrowser check: ${file}`);
  let log = "";
  const child = spawn(process.execPath, [path.join("scripts", file), url], { windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
  for (const [stream, destination] of [[child.stdout, process.stdout], [child.stderr, process.stderr]]) stream.on("data", chunk => { log += chunk; destination.write(chunk); });
  const code = await new Promise(resolve => {
    child.once("error", error => { log += error.stack; console.error(error.message); resolve(1); });
    child.once("close", code => resolve(code ?? 1));
  });
  fs.writeFileSync(path.join(output, `${file}.log`), log);
  reports.push({ check: file, status: code === 0 ? "passed" : "failed", exitCode: code });
}

async function stopServer() {
  if (!server?.pid || serverExited) return;
  if (process.platform === "win32") {
    // Stop only the process tree created by this runner, including Next's worker.
    await new Promise(resolve => {
      const stop = spawn("taskkill", ["/PID", String(server.pid), "/T", "/F"], { windowsHide: true, stdio: "ignore" });
      stop.once("error", resolve);
      stop.once("close", resolve);
    });
  } else {
    try { process.kill(-server.pid, "SIGTERM"); } catch { /* Already stopped. */ }
  }
}

try {
  const port = await freePort();
  const url = `http://127.0.0.1:${port}`;
  console.log(`Starting an isolated UI preview at ${url}`);
  server = spawn(process.execPath, [require.resolve("next/dist/bin/next"), "dev", "--hostname", "127.0.0.1", "--port", String(port)], {
    windowsHide: true,
    detached: process.platform !== "win32",
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, VANGUARD_DEV_DIST: dist, NEXT_PUBLIC_SITE_BASE_PATH: "" },
  });
  server.once("error", error => { serverError = error; });
  server.once("exit", () => { serverExited = true; });
  for (const stream of [server.stdout, server.stderr]) stream.on("data", chunk => { serverLog += chunk; });
  const deadline = Date.now() + 90000;
  let ready = false;
  while (Date.now() < deadline) {
    if (serverError || serverExited) throw serverError || new Error("UI preview exited before becoming ready.");
    try { if ((await fetch(`${url}/about`, { signal: AbortSignal.timeout(4000) })).ok) { ready = true; break; } } catch { /* Starting/compiling. */ }
    await delay(250);
  }
  if (!ready) throw new Error("UI preview did not become ready within 90 seconds.");
  // Sequential: each check owns a browser and uses its own clean page state.
  for (const file of ["check-layout.mjs", "check-gallery-editing.mjs", "check-preview-style-isolation.mjs"]) await runCheck(file, url);
  if (reports.some(report => report.status !== "passed")) process.exitCode = 1;
} catch (error) {
  console.error(error.stack || error.message);
  reports.push({ check: "UI preview setup", status: "failed", error: error.message });
  process.exitCode = 1;
} finally {
  await stopServer();
  // Next adds type-cache paths to tsconfig; remove only this runner's entries.
  const configPath = "tsconfig.json";
  const config = fs.readFileSync(configPath, "utf8");
  const cleaned = config.replace(/,\r?\n\s*"\.cache\/next-ui-validation\/(?:dev\/)?types\/\*\*\/\*\.ts"/g, "");
  if (cleaned !== config) fs.writeFileSync(configPath, cleaned);
  fs.writeFileSync(path.join(output, "ui-preview-server.log"), serverLog);
  fs.writeFileSync(path.join(output, "ui-validation-summary.json"), JSON.stringify({ passed: process.exitCode !== 1, checks: reports }, null, 2));
}
console.log(process.exitCode === 1 ? "\nUI validation FAILED. See .cache/qa/ui-validation-summary.json." : "\nUI validation PASSED.");
