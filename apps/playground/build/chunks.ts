import type { Plugin } from "vite";
import { fileURLToPath } from "node:url";

const normalize = (id: string): string => id.replace(/\\/g, "/").replace(/\?.*$/, "");
const sharedRuntime = new Set([
  "../src/themes.ts",
  "../src/preferences.ts",
  "../src/i18n/locale.ts",
  "../src/i18n/preload.ts",
  "../src/navigation.ts",
  "../src/page-loaders.ts"
].map((path) => normalize(fileURLToPath(new URL(path, import.meta.url)))));

/** Shared state and Vite's preload helper must not be exported by the HTML entry. */
export function playgroundManualChunks(id: string): string | undefined {
  const normalized = normalize(id);
  if (normalized === "\0vite/preload-helper.js" || sharedRuntime.has(normalized)) return "playground-runtime";
  return undefined;
}

interface PlaygroundChunk {
  fileName: string;
  isEntry: boolean;
  facadeModuleId: string | null;
  imports: readonly string[];
  dynamicImports: readonly string[];
}

/** Entry back-edges make lazy imports preload an application that already ran. */
export function assertPlaygroundEntryGraph(chunks: readonly PlaygroundChunk[]): void {
  const entries = new Set(chunks.filter((chunk) => chunk.isEntry && chunk.facadeModuleId
    && normalize(chunk.facadeModuleId).endsWith(".html")).map((chunk) => chunk.fileName));
  for (const chunk of chunks) {
    for (const target of [...chunk.imports, ...chunk.dynamicImports]) {
      if (target !== chunk.fileName && entries.has(target)) {
        throw new Error(`Playground chunk ${chunk.fileName} imports HTML entry ${target}; move shared code into a non-entry chunk.`);
      }
    }
  }
}

export function playgroundChunkGraph(): Plugin {
  return {
    name: "gavia-playground-entry-graph",
    apply: "build",
    generateBundle(_options, bundle) {
      assertPlaygroundEntryGraph(Object.values(bundle).filter((file) => file.type === "chunk"));
    }
  };
}
