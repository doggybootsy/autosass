import { SassMap, sassNull, SassString, sassFalse, sassTrue, SassList, SassNumber, Value } from "sass";

export type DiscordRelease = "stable" | "ptb" | "canary";

export function toSassValue(value?: boolean | string | number | Map<Value, Value> | any[] | Value | null | undefined) {
  if (value instanceof Value) return value;
  switch (typeof value) {
    case "boolean": {
      if (value) return sassTrue;
      return sassFalse;
    }
    case "number": return new SassNumber(value);
    case "string": return new SassString(value);
  }

  if (value instanceof Map) {
    // @ts-expect-error
    return new SassMap(value);
  }
  if (value === null || value === undefined) return sassNull;
  if (Array.isArray(value)) return new SassList(value);

  throw new TypeError("Unknown value");
}

export function getDiscordURL(release: DiscordRelease, pathname: string) {
  switch (release) {
    case "ptb": return new URL(pathname, "https://ptb.discord.com/");
    case "canary": return new URL(pathname, "https://canary.discord.com/");
    default: return new URL(pathname, "https://discord.com/");
  }
}