import { compileAsync, clearCache as $clearCache, type CompileOptions } from "./module";

export { type CompileOptions };

export const releases = Object.freeze(<const>[ "stable", "ptb", "canary" ]);

export const compile = compileAsync;
export const clearCache = $clearCache;
