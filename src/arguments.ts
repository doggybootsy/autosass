import { Command, Option } from "commander";
import { join } from "node:path";
import { exists } from "node:fs/promises";

import pkg from "../package.json";
import type { DiscordRelease } from "./util";

const program = new Command();

const inputOption = new Option("-i, --input <path>", "Path to the scss / sass file")
  .makeOptionMandatory(true);

// If argv[2] is a file and exists set that as the default value
if (typeof process.argv.at(2) === "string" && await exists(join(process.cwd(), process.argv.at(2)!))) {
  inputOption.default(process.argv.at(2));
}

// If argv[3] isn't a option, set it as out
let defaultOutput = join(process.cwd(), "dist");
if (typeof process.argv.at(3) === "string" && !process.argv.at(3)!.startsWith("-")) defaultOutput = process.argv.at(3)!;

program
  .name("autosass")
  .allowUnknownOption(true)
  .showSuggestionAfterError(false)
  .helpCommand(false)
  .version(pkg.version)
  .addOption(inputOption)
  .option("-o, --out <path>", "The directory to output the compiled files", defaultOutput)
  .addOption(
    new Option("-r, --release <releases...>", "The Discord releases you want to compile for")
      .choices([ "stable", "ptb", "canary" ])
      .default([ "stable", "ptb", "canary" ], "Each Release")
  )
  .option("-s, --sourcemap [boolean]", "Add SourceMaps", false)
  .option("-j, --source-map-include-sources [boolean]", "SourceMaps include source", false)
  .option("-m, --minify [boolean]", "Minify the output", false)
  .option("-c, --clear-cache [boolean]", "Clears the cache before compiling", false);

program.parse(process.argv, { from: "user" });

const options = program.opts();

function toBool(value: boolean | string, defaultValue = false): boolean {
  if (typeof value === "boolean") return value;
  try {
    const result = JSON.parse(value);    
    if (typeof result === "boolean") return result;
  } 
  finally {
    return defaultValue;
  }
}

export const input = join(process.cwd(), options.input);
export const output = join(process.cwd(), options.out);
export const release: DiscordRelease[] = Array.from(new Set(options.release));
export const sourcemap = toBool(options.sourcemap);
export const sourceMapIncludeSources = toBool(options.sourceMapIncludeSources);
export const minify = toBool(options.minify);
export const clearCache = toBool(options.clearCache);
