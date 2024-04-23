# Autosass
Autosass is a SASS compiler, thats primarly usage is for Discord Themes. Autosass can be used in cli or can be imported in any bun project

To use autosass you need [Bun](https://bun.sh/) installed. It uses the Bun global and HTMLWriter global

## Installing
Install the autosass module globally `npm install --global autosass` or locally `npm install autosass`

## CLI usage
Basic usage of the cli command works like
`autosass <path to sass / scss file> <path to out directory>`

To see all of the cli arguments run `autosass --help`

## Programmical usage
The `autosass` module has 4 exports. 2 functions, 1 readonly array, and 1 type
### Compiling
autosass has a exported function named `compile` that works just like [`sass.compileAsync`](https://sass-lang.com/documentation/js-api/functions/compileasync/). The only difference between the compile and `sass.compileAsync` is that `compile` supports a option called `release`

### Clearing Cache
The `clearCache` function just removes the cache. If you run this, you need to run it before `compile`

### Example

```ts
import { join } from "node:path";
import { compile, releases, clearCache } from "autosass";

await clearCache();

for (const release of releases) {
  const { css } = await compile("./path/to/scss/or/sass", { release, minify: true });
  const path = join(import.meta.dirname, "out", `${release}.css`);

  Bun.write(path, css, { createPath: true });
}
```
