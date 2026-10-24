/** Kept dynamic by Vite library mode and replaced by consumer bundlers. */
declare const process: { env: { NODE_ENV?: string } };

export function isWlDevelopment(): boolean {
  try {
    return process.env.NODE_ENV !== "production";
  } catch {
    // Plain browser ESM has no Node environment; diagnostics remain optional.
    return false;
  }
}
