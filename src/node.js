#!/usr/bin/env node
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

function bun() {
  return spawn("bun", Array.from(arguments), { env: process.env, cwd: process.cwd() });
}

const child = bun("--revision");

child.on("error", () => {
  console.log("Bun was not found! autosass requires bun to run, install it here https://bun.sh/");
  process.exit(1);
});
child.on("spawn", () => {
  const cli = join(dirname(fileURLToPath(import.meta.url)), "cli.ts");
  
  const child = bun("run", cli, ...process.argv.slice(2));
  
  child.stdout.pipe(process.stdout);
  child.stderr.pipe(process.stderr);
});
