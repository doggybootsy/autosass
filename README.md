# Autosass
Autosass is a SASS compiler, thats primarly usage is for Discord Themes. Autosass can be used in cli or can be imported in any bun project. 

To use autosass you need [Bun](https://bun.sh/) installed. It uses the Bun global and HTMLWriter global

autosass is based off of a different project called [autocss](https://github.com/LosersUnited/AutoCSS);

# Installing
Install the autosass module globally `npm install --global autosass` or locally `npm install autosass`

# CLI usage
Basic usage of the cli command works like
`autosass <path to sass / scss file> <path to out directory>`

To see all of the cli arguments run `autosass --help`

# Programmical usage
The `autosass` module has 4 exports. 2 functions, 1 readonly array, and 1 type
## Compiling
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

  await Bun.write(path, css, { createPath: true });
}
```

# Sass Functions
autosass has a module you can use called `autosass`. Warning if you have a file called `autosass` in your directory it will import that file over `autosass`

You import it like `@use "autosass";` or `@use "autosass" as *;`. 

You can also set `$null-selector` like `@use "autosass" with ( $null-selector: ".my-selector-name" );`

## Functions
### autosass
`autosass` is the primary function. `get` is a alias for it

It can parse args in a few different ways and can return a different result depending on the args passed 

#### Examples
```scss
// In this config it will get a class map (or null if the query fails).
// Then it will use that map and get a class of it
@use "autosass" as *;

// If this is null, autosass will warn
$section: autosass("lastSection", "section"); // type-of() == map or null

// Doesn't matter if $section is a map or null
// If its null it will return the error selector
$class: autosass($section, "section"); // type-of() == string
```
```scss
// In this config the first argument for autosass will be a list
// autosass treats this like 'autosass(autosass($list...), $class)'
@use "autosass" as *;

$class: autosass(( "lastSection", "section" ), "section"); // type-of() == string

// Warning: If you do this sass treats it as 'autosass("lastSection", "section")'
$class: autosass(( "lastSection" ), "section"); // type-of() == map or null
```
```scss
// In this config the arguments will be named keys
// The key '$keys' can be a string or a list
// The key '$class' must be a string

@use "autosass" as *;

$class: autosass($keys: ( "lastSection", "section" ), $class: "section"); // type-of() == string
// This is also ok. autosass converts '$keys' to a list
$class: autosass($keys: "lastSection", $class: "section"); // type-of() == string
```
```scss
// In this config the arguments will be considered the keys unless its the named '$class' key
// The key '$class' must be a string
@use "autosass" as *;

$class: autosass("lastSection", "section", $class: "section"); // type-of() == string
// This is also ok
$class: autosass("lastSection", $class: "section"); // type-of() == string
```
### get
`get` is just a alias for `autosass`. It exists for if you import autosass like `@use "autosass";` so you don't have to write `autosass.autosass`
### version
`version` this returns the version of autosass

#### example
```scss
@use "autosass";

@debug autosass.version(); // Debug: <autosass current version>;
```

### release
`release` this returns the release that your compiling for. Can only be `stable` / `ptb` / `canary`

#### example
```scss
@use "autosass";

@debug autosass.release(); // Debug: <stable / ptb / canary>;
```