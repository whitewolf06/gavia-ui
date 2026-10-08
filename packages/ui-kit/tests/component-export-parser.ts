import ts from "typescript";

export interface ComponentExport {
  name: string;
  file: string;
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
