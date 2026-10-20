declare module "node:fs" {
  import type { Buffer } from "node:buffer";

  export function readFileSync(path: string | URL, encoding: "utf8"): string;
  export function readFileSync(path: string | URL): Buffer;
}
