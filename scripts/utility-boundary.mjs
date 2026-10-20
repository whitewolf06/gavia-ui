import { readFileSync, realpathSync } from "node:fs";
import { dirname, isAbsolute, relative, resolve } from "node:path";
import ts from "typescript";

/** Verify the installed JS graph, including shared chunks, rather than just its entry source. */
export function assertPureUtilityEntry(packageRoot, entry = "dist/utils.js") {
  const root = realpathSync(packageRoot);
  const visited = new Set();
  function visit(filename) {
    const file = realpathSync(filename);
    const within = relative(root, file);
    if (within.startsWith("..") || isAbsolute(within)) throw new Error(`Utility dependency escapes package: ${file}`);
    if (visited.has(file)) return;
    visited.add(file);
    if (file.endsWith(".json")) return;
    const ast = ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
    function dependency(specifier) {
      if (!specifier.startsWith(".")) throw new Error(`Pure utils entry imports runtime dependency ${specifier}`);
      visit(resolve(dirname(file), specifier));
    }
    function inspect(node) {
      if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node))
        && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) dependency(node.moduleSpecifier.text);
      if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) {
        const argument = node.arguments[0];
        if (!argument || !ts.isStringLiteral(argument)) throw new Error("Pure utils entry has an untraceable dynamic import");
        dependency(argument.text);
      }
      ts.forEachChild(node, inspect);
    }
    inspect(ast);
  }
  visit(resolve(root, entry));
  return [...visited].map((file) => relative(root, file));
}
