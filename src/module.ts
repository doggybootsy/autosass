import { compileAsync as compile, SassString, type CompileResult, type CustomFunction, type Importer, type ImporterResult, type Options, type Syntax } from "sass";
import { randomBytes } from "node:crypto";
import { join } from "node:path";
import { readFile, exists, rm } from "node:fs/promises";

import { toSassValue, type DiscordRelease } from "./util";
import { fetchModules } from "./request";

import pkg from "../package.json";

process.versions.autosass = pkg.version;


export type CompileOptions = Options<"async"> & { release?: DiscordRelease };

export const NATIVE_SECRET_STRING = randomBytes(30).toString("hex");

const autoSassPath = join(import.meta.dirname, "autosass", "index.scss");
const autoSassUtilPath = join(import.meta.dirname, "autosass", "util.scss");

const autoSassURL = Bun.pathToFileURL(autoSassPath);
const autoSassUtilURL = Bun.pathToFileURL(autoSassUtilPath);
const autoSass = await readFile(autoSassPath, "binary");
const autoSassUtil = await readFile(autoSassUtilPath, "binary");

const toImporterResult = (contents: string, syntax: Syntax = "scss"): ImporterResult => ({ contents, syntax });

const importer: Importer<"sync"> = {
  canonicalize(url, context) {    
    if (url === "autosass" || url === "@__autosass__") return autoSassURL;
    if (url === "autosass/util" && context.containingUrl?.href === autoSassURL.href) return autoSassUtilURL;
    
    return null;
  },
  load(canonicalUrl) {
    switch (canonicalUrl.href) {
      case autoSassURL.href: return toImporterResult(autoSass, "scss");
      case autoSassUtilURL.href: return toImporterResult(`$secret: ${JSON.stringify(NATIVE_SECRET_STRING)};\n${autoSassUtil}`, "scss");
      default: return null;
    }
  }
}

export async function compileAsync(path: string, options?: CompileOptions | undefined): Promise<CompileResult> {
  options = Object.assign({}, options);

  let release: DiscordRelease;
  switch (options.release) {
    case "canary":
    case "ptb": {
      release = options.release;
      break;
    }
  
    default: release = "stable";
  }
  
  const getModuleByKeys = await fetchModules(release);

  const native: CustomFunction<"async"> = ([ $secret, $action, $args ]) => {
    if ($secret.assertString().text !== NATIVE_SECRET_STRING) return toSassValue();
    
    const action = $action.assertString().text;

    switch (action) {
      case "get-module": {
        const keys: string[] = [];
      
        for (const value of $args.asList) {
          keys.push(value.assertString().text);
        }
  
        const map = new Map<SassString, SassString>();
  
        const module = getModuleByKeys(keys);
  
        if (!module) return toSassValue();
        
        for (const key in module) {
          if (Object.prototype.hasOwnProperty.call(module, key)) {
            map.set(new SassString(key), new SassString(`.${module[key].split(" ").join(".")}`, { quotes: false }));
          }
        }
  
        return toSassValue(map);
      }

      case "release": return toSassValue(release);
      case "version": return toSassValue(process.versions.autosass);
    
      default: return toSassValue();
    }
  };

  options.functions = Object.assign({}, options.functions, { "__autosass_native__($secret, $action, $args...)": native });
  options.importers = Array.isArray(options.importers) ? [ ...options.importers, importer ] : [ importer ];

  return compile(path, options);
}

export async function clearCache() {    
  const BASE_DIRECTORY = join(process.cwd(), ".autosass");
  
  if (await exists(BASE_DIRECTORY)) {
    console.log("Clearing cache...");
    await rm(BASE_DIRECTORY, { force: true, recursive: true });
    console.log("Cache cleared!");
  }
}