import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, relative, resolve } from "node:path";

const requireKit = createRequire(new URL("../packages/ui-kit/package.json", import.meta.url));
const ts = requireKit("typescript");

/** TypeScript replaces .js with .d.ts and .vue.js with .vue.d.ts in ESM resolution. */
function declarationSpecifier(specifier, filePath, { sourceRoot, outDir }) {
  if (!/^(?:\.\.?\/|\.\.?$)/.test(specifier) || /\.(?:[cm]?js|json|css|svg|png|woff2?)$/i.test(specifier)) return specifier;
  const source = resolve(sourceRoot, relative(outDir, dirname(filePath)), specifier);
  for (const [extension, output] of [[".d.mts", ".mjs"], [".d.cts", ".cjs"], [".d.ts", ".js"], [".mts", ".mjs"], [".cts", ".cjs"], [".tsx", ".js"], [".ts", ".js"]]) {
    if (specifier.endsWith(extension)) return specifier.slice(0, -extension.length) + output;
  }
  if (specifier.endsWith(".vue") && existsSync(source)) return specifier + ".js";
  const extensions = [[".ts", ".js"], [".tsx", ".js"], [".mts", ".mjs"], [".cts", ".cjs"], [".d.ts", ".js"]];
  for (const [extension, output] of extensions) {
    if (existsSync(source + extension)) return specifier + output;
  }
  for (const [extension, output] of extensions) {
    if (existsSync(resolve(source, "index" + extension))) return specifier.replace(/\/$/, "") + "/index" + output;
  }
  throw new Error(`Cannot resolve declaration import ${JSON.stringify(specifier)} from ${filePath}`);
}

/** Rewrite module string literals only; prose, comments and literal API values stay intact. */
export function normalizeDeclarationSpecifiers(content, filePath, options) {
  const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const replacements = new Map();
  const record = (literal) => {
    if (!literal || !ts.isStringLiteral(literal)) return;
    const next = declarationSpecifier(literal.text, filePath, options);
    if (next !== literal.text) replacements.set(literal.pos, {
      start: literal.getStart(sourceFile), end: literal.end, value: JSON.stringify(next)
    });
  };
  const visit = (node) => {
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) record(node.moduleSpecifier);
    else if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument)) record(node.argument.literal);
    else if (ts.isImportEqualsDeclaration(node) && ts.isExternalModuleReference(node.moduleReference))
      record(node.moduleReference.expression);
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  let result = content;
  for (const edit of [...replacements.values()].sort((left, right) => right.start - left.start)) {
    result = result.slice(0, edit.start) + edit.value + result.slice(edit.end);
  }
  return result;
}
