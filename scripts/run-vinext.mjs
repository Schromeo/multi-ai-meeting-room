import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const allowedCommands = new Set(["dev", "build", "start"]);
const [command, ...args] = process.argv.slice(2);

if (!allowedCommands.has(command)) {
  console.error("Usage: node scripts/run-vinext.mjs <dev|build|start> [...args]");
  process.exit(2);
}

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const vinextEntry = fileURLToPath(import.meta.resolve("vinext"));
const vinextCli = resolve(dirname(vinextEntry), "cli.js");
const previewConfig = resolve(projectRoot, "dist/server/wrangler.json");
if (command === "start" && !existsSync(previewConfig)) {
  console.error("Run pnpm build before starting the local production preview.");
  process.exit(1);
}

// Serve the built Worker and its asset binding together. Vinext's static cache
// uses Windows filesystem separators for URL keys in the pinned release.
const previewArgs = args.map((arg) => arg.replace(/^(?:--hostname|-H)(?==|$)/, "--ip").replace(/^-p(?==|$)/, "--port"));
function previewDefault(flag, value) {
  return previewArgs.some((arg) => arg === flag || arg.startsWith(`${flag}=`)) ? [] : [flag, value];
}
const commandArgs = command === "start"
  ? [resolve(projectRoot, "node_modules/wrangler/bin/wrangler.js"), "dev", "--local",
    "--config", previewConfig, ...previewDefault("--ip", "127.0.0.1"),
    ...previewDefault("--port", process.env.PORT ?? "3000"), ...previewDefault("--inspector-port", "0"),
    "--persist-to", ".wrangler/state", ...previewArgs]
  : [vinextCli, command, ...args];
const result = spawnSync(process.execPath, commandArgs, {
  cwd: projectRoot,
  env: {
    ...process.env,
    WRANGLER_LOG_PATH: resolve(projectRoot, ".wrangler", "wrangler.log"),
    WRANGLER_SEND_METRICS: "false",
  },
  stdio: "inherit",
});

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);
