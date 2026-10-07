declare module "node:fs" {
  export function readFileSync(path: string | URL, encoding: "utf8"): string;
  export function readFileSync(path: string | URL): import("node:buffer").Buffer;
}
