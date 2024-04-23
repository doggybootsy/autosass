import { compileAsync, clearCache as $clearCache } from "./module";

export const releases = Object.freeze(<const>[ "stable", "ptb", "canary" ]);

export const compile = compileAsync;
export const clearCache = $clearCache;
