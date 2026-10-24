import ts from "typescript";
import { parse as parseSfc } from "vue/compiler-sfc";

export interface ComponentExport {
  name: string;
  file: string;
}

/** Read real template attributes; a bound expression requires a literal fallback. */
export function parseComponentMarkers(source: string): string[] {
  const ast = parseSfc(source).descriptor.template?.ast;
  if (!ast) throw new Error("Component template is required");
  const result: string[] = [];
  function visit(node: NonNullable<typeof ast>["children"][number]): void {
    if (node.type !== 1) return;
    for (const prop of node.props) {
      if (prop.type === 6 && prop.name === "data-wl") result.push(prop.value?.content ?? "");
      if (prop.type !== 7 || prop.name !== "bind" || prop.arg?.type !== 4
        || prop.arg.content !== "data-wl") continue;
      if (prop.exp?.type !== 4) throw new Error("Bound data-wl requires an expression");
      const script = ts.createSourceFile("marker.ts", `(${prop.exp.content})`, ts.ScriptTarget.Latest, true);
      const statement = script.statements[0];
      if (!statement || !ts.isExpressionStatement(statement)) throw new Error("Invalid data-wl expression");
      let expression = statement.expression;
      while (ts.isParenthesizedExpression(expression)) expression = expression.expression;
      while (ts.isBinaryExpression(expression) && expression.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken) {
        expression = expression.right;
      }
      if (!ts.isStringLiteralLike(expression)) throw new Error("Bound data-wl requires a stable literal fallback");
      result.push(expression.text);
    }
    node.children.forEach(visit);
  }
  ast.children.forEach(visit);
  return result;
}

/** Vue generates update events for the exact names declared by defineModel. */
export function parseComponentModels(source: string): Set<string> {
  const script = parseSfc(source).descriptor.scriptSetup?.content;
  if (script === undefined) throw new Error("Component setup script is required");
  const ast = ts.createSourceFile("models.ts", script, ts.ScriptTarget.Latest, true);
  const names = new Set<string>();
  function visit(node: ts.Node): void {
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === "defineModel") {
      const argument = node.arguments[0];
      names.add(argument && ts.isStringLiteralLike(argument) ? argument.text : "modelValue");
    }
    ts.forEachChild(node, visit);
  }
  visit(ast);
  return names;
}

/** Resolve the supported barrel forms without accepting rendering wrappers as type-only facades. */
export function parseComponentExports(barrel: string, facades: Record<string, string>): ComponentExport[] {
  const index = ts.createSourceFile("index.ts", barrel, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const result: ComponentExport[] = [];
  const names = new Set<string>();
  for (const statement of index.statements) {
    if (!ts.isExportDeclaration(statement) || statement.isTypeOnly) continue;
    if (!statement.moduleSpecifier || !ts.isStringLiteral(statement.moduleSpecifier)
      || !statement.exportClause || !ts.isNamedExports(statement.exportClause)) {
      throw new Error("Component barrels require explicit named reexports");
    }
    const module = statement.moduleSpecifier.text;
    for (const exported of statement.exportClause.elements) {
      if (exported.isTypeOnly) continue;
      const name = exported.name.text;
      if (!/^Wl\w+$/.test(name) || names.has(name)) throw new Error(`Invalid or duplicate component export: ${name}`);
      names.add(name);
      const importedName = exported.propertyName?.text ?? name;
      if (module.endsWith(".vue")) {
        if (importedName !== "default") throw new Error(`${name}: SFC reexports must refer to its default export`);
        if (module !== `./${name}.vue`) throw new Error(`${name}: export refers to a different component`);
        result.push({ name, file: module });
        continue;
      }
      const source = facades[module];
      if (source === undefined) throw new Error(`${name}: facade source not found: ${module}`);
      const file = resolveFacadeImport(module, source, importedName);
      if (file !== `./${name}.vue`) throw new Error(`${name}: export refers to a different component`);
      result.push({ name, file });
    }
  }
  return result;
}

function resolveFacadeImport(module: string, source: string, name: string): string {
  const facade = ts.createSourceFile(`${module}.ts`, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const imports = new Map<string, string>();
  let identity: string | undefined;
  for (const statement of facade.statements) {
    if (ts.isImportDeclaration(statement) && statement.importClause?.name && !statement.importClause.isTypeOnly
      && ts.isStringLiteral(statement.moduleSpecifier)) {
      imports.set(statement.importClause.name.text, statement.moduleSpecifier.text);
    }
    if (!ts.isVariableStatement(statement)
      || !statement.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (!ts.isIdentifier(declaration.name) || declaration.name.text !== name || !declaration.initializer) continue;
      if (identity !== undefined) throw new Error(`${module}: duplicate exported identity: ${name}`);
      let expression = declaration.initializer;
      while (ts.isAsExpression(expression) || ts.isTypeAssertionExpression(expression)
        || ts.isSatisfiesExpression(expression) || ts.isParenthesizedExpression(expression)) {
        expression = expression.expression;
      }
      if (!ts.isIdentifier(expression)) throw new Error(`${name}: facade must preserve its imported SFC identity`);
      identity = expression.text;
    }
  }
  const file = identity === undefined ? undefined : imports.get(identity);
  if (!file?.endsWith(".vue")) throw new Error(`${name}: exported identity must come from a default SFC import`);
  return file;
}
