import { gzipSync } from "node:zlib";

export function measureJavaScript(bundle) {
  return Object.values(bundle).filter((file) => file.type === "chunk").reduce((total, chunk) => ({
    bytes: total.bytes + Buffer.byteLength(chunk.code),
    gzip: total.gzip + gzipSync(chunk.code).byteLength
  }), { bytes: 0, gzip: 0 });
}

export function createSizeLimits(measurements) {
  return Object.fromEntries(measurements.map((row) => [row.name, Math.ceil(row.gzip * 1.05)]));
}

export function checkSizeLimits(measurements, limits) {
  return measurements.flatMap((row) => {
    const limit = limits[row.name];
    if (!Number.isSafeInteger(limit) || limit <= 0) return [`${row.name}: no reviewed baseline; explicitly record after a fresh library build`];
    return row.gzip > limit ? [`${row.name}: ${row.gzip} gzip bytes exceeds ${limit}`] : [];
  });
}
