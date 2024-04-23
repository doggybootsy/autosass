type CompileResult = import("sass").CompileResult;
type Options = import("sass").Options<"async">;

export type DiscordRelease = "stable" | "ptb" | "canary";
export type CompileOptions = Options & { release?: DiscordRelease };

export const releases: readonly [ "stable", "ptb", "canary" ];

export function compile(input: string, options?: CompileOptions | undefined): Promise<CompileResult>;
export function clearCache(): Promise<void>;