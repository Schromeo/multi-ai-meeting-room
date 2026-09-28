import { spawnSync } from "node:child_process";
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
const result = spawnSync(process.execPath, [vinextCli, command, ...args], {
  cwd: projectRoot,
  env: {
    ...process.env,
    WRANGLER_LOG_PATH: resolve(projectRoot, ".wrangler", "wrangler.log"),
  },
  stdio: "inherit",
});

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);
