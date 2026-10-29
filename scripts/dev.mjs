import { spawn } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const args = process.argv.slice(2);
const portFlag = args.findIndex(arg => arg === "--port" || arg === "-p");
const port = portFlag >= 0 ? args[portFlag + 1] : args.find(arg => arg.startsWith("--port="))?.split("=")[1];
if (port && !/^\d+$/.test(port)) throw new Error("Invalid development port");
// Fivora starts a second dev server on 4173. Give each explicitly selected
// preview port its own Next cache/lock so normal localhost:3000 can stay open.
const child = spawn(process.execPath, [require.resolve("next/dist/bin/next"), "dev", ...args], {
  stdio: "inherit",
  windowsHide: true,
  env: { ...process.env, VANGUARD_DEV_DIST: port ? `.cache/next-preview-${port}` : ".next" },
});
child.on("error", error => { console.error(error.message); process.exitCode = 1; });
child.on("exit", code => { process.exitCode = code ?? 1; });
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => child.kill(signal));
