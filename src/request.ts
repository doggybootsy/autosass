import { join } from "node:path";
import { exists, rm, readFile, mkdir } from "node:fs/promises";

import { getDiscordURL, type DiscordRelease } from "./util";

type RawModule = (exports: any, module: any, require: any) => void;

const BASE_DIRECTORY = join(process.cwd(), ".autosass");

export async function fetchModules(release: DiscordRelease) {
  if (!await exists(BASE_DIRECTORY)) await mkdir(BASE_DIRECTORY);
  if (!await exists(join(BASE_DIRECTORY, release))) await mkdir(join(BASE_DIRECTORY, release));

  const modules: Record<string, RawModule> = {};
  const cache: Record<string, { exports: Record<string, string> }> = {};

  function require(id: string) {  
    if (id in cache) return cache[id].exports;
    if (!(id in modules)) return {};
  
    const module = { exports: {}, id };
    cache[id] = module;  
    
    modules[id].call(global, module, module.exports, require);
  
    return module.exports;
  }

  let text: string;

  const webpackChunkdiscord_app = {
    push([ ids, webpackModules ]: [ ids: any[], webpackModules: Record<string, (exports: any, module: any, require: any) => void> ]) {
      Object.assign(modules, webpackModules);      

      for (const key in modules) {
        if (Object.prototype.hasOwnProperty.call(modules, key)) {          
          require(key);
        }
      }
    }
  }

  if (await exists(join(BASE_DIRECTORY, release, "app.html"))) text = await readFile(join(BASE_DIRECTORY, release, "app.html"), "binary");
  else {
    console.log(`Fetching ${getDiscordURL(release, "/")}, this may take a moment...`);

    const res = await fetch(getDiscordURL(release, "/app"));
  
    text = await res.text();
  
    await Bun.write(join(BASE_DIRECTORY, release, "app.html"), text, { createPath: true });
  }

  const parser = new HTMLRewriter();

  parser.on("script[src]", {
    async element(element) {
      const src = element.getAttribute("src")!;

      const url = getDiscordURL(release, src);
      const path = join(BASE_DIRECTORY, release, ...url.pathname.split("/"));      

      let text: string;
      if (await exists(path)) text = await readFile(path, "binary");
      else {
        const res = await fetch(url);
    
        text = await res.text();

        await Bun.write(path, text, { createPath: true });
      }      

      if (!/function\((.{1,3})\){"use strict";\1\.exports={(.+)?:"\2_/.test(text)) return;

      new Function(text).call({ webpackChunkdiscord_app });
    }
  });

  parser.transform(text);

  return function getModuleByKeys(keys: string[]) {  
    for (const id in cache) {
      if (Object.prototype.hasOwnProperty.call(cache, id)) {
        const module = cache[id];
        
        if (keys.every((key) => key in module.exports)) return module.exports;
      }
    }
  }
}
