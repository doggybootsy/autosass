if (!process.isBun) throw new Error("AutoSASS requires Bun to run!");

import { join } from "node:path";

import { release } from "./arguments";
import { type DiscordRelease } from "./util";
import * as args from "./arguments";
import { clearCache, compileAsync } from "./module";

async function compile(release: DiscordRelease) {
  console.log(`Compiling for ${release}...`);

  const result = await compileAsync(args.input, {
    sourceMap: args.sourcemap,
    sourceMapIncludeSources: args.sourceMapIncludeSources,
    charset: true,
    style: args.minify ? "compressed" : "expanded"
  });
  
  await Bun.write(join(args.output, `${release}.css`), result.css, { createPath: true });
  if (args.sourcemap) await Bun.write(join(args.output, `${release}.css.map`), JSON.stringify(result.sourceMap), { createPath: true });
  
  console.log(`Successfully ${release} compiled!`);
}

if (args.clearCache) await clearCache();

for (const $release of release) await compile($release);
