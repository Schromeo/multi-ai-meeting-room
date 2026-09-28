import { existsSync } from "node:fs";
import { spawn, spawnSync } from "node:child_process";
import process from "node:process";

const port = Number(process.env.PORT ?? 3000);
const url = `http://localhost:${port}`;
const packageManager = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
const dependenciesReady = existsSync("node_modules/.bin/vinext") || existsSync("node_modules/.bin/vinext.cmd");

if (!dependenciesReady) {
  console.log("Dependencies are not installed. Installing with the locked pnpm dependencies...");
  const install = spawnSync(packageManager, ["install", "--frozen-lockfile"], {
    stdio: "inherit",
    shell: false,
  });
  if (install.error) {
    console.error(`Could not start pnpm: ${install.error.message}`);
    process.exit(1);
  }
  if (install.status !== 0) process.exit(install.status ?? 1);
}

const server = spawn(packageManager, ["dev"], {
  stdio: "inherit",
  shell: process.platform === "win32",
  env: process.env,
});

let opened = false;
let attempts = 0;
const poll = setInterval(async () => {
  attempts += 1;
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(1_000) });
    if (!opened && response.status < 500) {
      opened = true;
      clearInterval(poll);
      openBrowser(url);
      console.log(`Meeting Room is ready at ${url}`);
    }
  } catch {
    if (attempts >= 120) {
      clearInterval(poll);
      console.error(`The development server did not become ready at ${url}.`);
    }
  }
}, 500);

function openBrowser(target) {
  const command = process.platform === "win32" ? "cmd" : process.platform === "darwin" ? "open" : "xdg-open";
  const args = process.platform === "win32" ? ["/c", "start", "", target] : [target];
  spawn(command, args, { detached: true, stdio: "ignore", shell: false }).unref();
}

function stop() {
  clearInterval(poll);
  if (!server.killed) server.kill("SIGINT");
}

process.on("SIGINT", stop);
process.on("SIGTERM", stop);
server.on("exit", (code, signal) => {
  clearInterval(poll);
  if (signal) process.kill(process.pid, signal);
  else process.exit(code ?? 1);
});
