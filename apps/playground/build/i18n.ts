import type { Plugin } from "vite";
import VueI18nPlugin from "@intlify/unplugin-vue-i18n/vite";
import { readFile } from "node:fs/promises";
import { basename } from "node:path";
import { fileURLToPath } from "node:url";
import { catalogTextKey, flattenCatalog } from "../src/i18n/catalog";

const messagesDirectory = fileURLToPath(new URL("../src/i18n/messages/", import.meta.url)).split("\\").join("/");
const virtualDirectory = fileURLToPath(new URL("../src/i18n/precompiled/", import.meta.url)).split("\\").join("/");
interface Metadata { aliases: Record<string, string>; sourceMessages: Record<string, string> | true; parameters: Record<string, string[]> }

/** Encode prose/code literally; preserve only the site's named placeholders. */
export function literalMessage(text: string): string {
  const literal = (part: string) => part
    ? "{'" + part.replace(/\\/g, "\\\\").replace(/'/g, "\\u0027")
      // eslint-disable-next-line no-control-regex -- Encode controls before Intlify parses single-line literals.
      .replace(/[\u0000-\u001f\u2028\u2029]/g, (char) => "\\u" + char.charCodeAt(0).toString(16).padStart(4, "0")) + "'}"
    : "";
  let output = "";
  let start = 0;
  for (const match of text.matchAll(/\{(\w+)\}/g)) {
    output += literal(text.slice(start, match.index)) + match[0];
    start = match.index + match[0].length;
  }
  return output + literal(text.slice(start)) || "{''}";
}

/** Compile virtual resources while keeping canonical JSON usable by Node tools. */
export function playgroundI18nPlugins(): Plugin[] {
  const metadata = new Map<string, Metadata>();
  const resource: Plugin = {
    name: "gavia-literal-i18n-resources",
    enforce: "pre",
    resolveId(id) {
      const file = basename(id);
      if (/^(?:shell|documentation|examples|tokens|changelog)\.(?:en|ru)\.json\?compiled$/.test(file)) {
        return virtualDirectory + file.slice(0, -"?compiled".length);
      }
    },
    async load(id) {
      if (!id.startsWith(virtualDirectory)) return;
      const file = basename(id);
      const namespace = file.split(".")[0]!;
      const language = file.split(".")[1]!;
      const read = async (name: string, locale: string): Promise<Record<string, string>> => {
        const path = messagesDirectory + name + "." + locale + ".json";
        this.addWatchFile(path);
        return flattenCatalog(JSON.parse(await readFile(path, "utf8")) as Record<string, unknown>, name);
      };
      // Missing translations use English at build time, without downloading the
      // other full language catalogue during a Russian visit.
      const catalog = language === "ru"
        ? { ...await read(namespace, "en"), ...await read(namespace, language) }
        : await read(namespace, language);
      // The home page uses two Button messages; do not fetch the full examples catalogue.
      if (namespace === "shell") {
        const examples = await read("examples", language);
        for (const key of ["examples.add_0017", "examples.clicks_0018"]) catalog[key] = examples[key]!;
      }
      const aliases: Record<string, string> = {};
      const texts = new Map<string, string>();
      if (namespace === "documentation" || namespace === "changelog") {
        for (const locale of ["en", "ru"]) for (const [key, text] of Object.entries(await read(namespace, locale))) {
          const hash = catalogTextKey(text);
          if (texts.has(hash) && texts.get(hash) !== text) this.error("Localization reverse lookup collision");
          texts.set(hash, text);
          aliases[hash] = key;
        }
      }
      const parameters = Object.fromEntries(Object.entries(catalog).flatMap(([key, text]) => {
        const names = Array.from(text.matchAll(/\{(\w+)\}/g), (match) => match[1]!);
        return names.length ? [[key, names]] : [];
      }));
      const sourceMessages = namespace === "examples" || namespace === "documentation"
        ? true
        : namespace === "shell"
          ? Object.fromEntries(Object.entries(catalog).filter(([key]) => key.startsWith("examples.")))
          : {};
      metadata.set(id, { aliases, sourceMessages, parameters });
      return JSON.stringify(Object.fromEntries(Object.entries(catalog).map(([key, text]) => [key, literalMessage(text)])));
    }
  };
  const exports: Plugin = {
    name: "gavia-i18n-resource-metadata",
    enforce: "post",
    transform(code, id) {
      const value = metadata.get(id);
      if (!value) return;
      return { code: code + Object.entries(value).map(([key, data]) => "\nexport const " + key + " = " + JSON.stringify(data) + ";").join(""), map: null };
    }
  };
  return [resource, ...[VueI18nPlugin({
    include: virtualDirectory + "*.json",
    runtimeOnly: true,
    dropMessageCompiler: true,
    compositionOnly: true,
    fullInstall: false,
    strictMessage: false,
    escapeHtml: false
  })].flat(), exports];
}
