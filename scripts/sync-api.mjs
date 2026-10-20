import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
const { parse: parseSfc } = createRequire(new URL("../packages/ui-kit/package.json", import.meta.url))("vue/compiler-sfc");

/** Read literal Vue macro types without evaluating component modules or defaults. */
export function extractComponentApi(source, filename = "Component.vue", readModule = (path) => existsSync(path) ? readFileSync(path, "utf8") : undefined) {
  const script = parseSfc(source, { filename }).descriptor.scriptSetup?.content;
  if (script === undefined) throw new Error(`Missing setup script: ${filename}`);
  const ast = ts.createSourceFile(filename + ".ts", script, ts.ScriptTarget.Latest, true);
  const result = {
    props: {}, slots: {}, emits: {}, models: {}, defaults: {}, required: [],
    descriptions: {}, slotDescriptions: {}, eventDescriptions: {}
  };
  const declarations = new Map();
  for (const node of ast.statements) {
    if (ts.isTypeAliasDeclaration(node)) declarations.set(node.name.text, node.type);
    if (ts.isInterfaceDeclaration(node)) declarations.set(node.name.text, node);
  }
  const scopes = new Map([[ast, declarations]]);
  const modules = new Map();
  function declaration(type, scope) {
    const name = type.typeName?.getText(scope);
    const local = scopes.get(scope)?.get(name);
    if (local) return { type: local, scope };
    for (const statement of scope.statements) {
      if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier) || !statement.moduleSpecifier.text.startsWith(".")) continue;
      const imports = statement.importClause?.namedBindings;
      if (!imports || !ts.isNamedImports(imports)) continue;
      const imported = imports.elements.find((element) => element.name.text === name);
      if (!imported) continue;
      const path = resolve(dirname(scope === ast ? filename : scope.fileName), statement.moduleSpecifier.text.replace(/\.js$/, "") + ".ts");
      if (!modules.has(path)) {
        const text = readModule(path);
        const file = text === undefined ? undefined : ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true);
        modules.set(path, file);
        if (file) scopes.set(file, new Map(file.statements.flatMap((node) =>
          ts.isTypeAliasDeclaration(node)
            ? [[node.name.text, node.type]]
            : ts.isInterfaceDeclaration(node) ? [[node.name.text, node]] : [])));
      }
      const file = modules.get(path);
      const resolved = file && scopes.get(file)?.get(imported.propertyName?.text ?? imported.name.text);
      if (resolved) return { type: resolved, scope: file };
    }
    return undefined;
  }
  function slotMembers(type, scope = ast, seen = new Set()) {
    if (!type || seen.has(type)) return;
    seen.add(type);
    if (ts.isTypeReferenceNode(type)) {
      const resolved = declaration(type, scope);
      if (resolved) slotMembers(resolved.type, resolved.scope, seen);
      return;
    }
    if (ts.isIntersectionTypeNode(type)) {
      for (const item of type.types) slotMembers(item, scope, seen);
      return;
    }
    if (ts.isMappedTypeNode(type) && type.nameType) {
      const name = type.nameType.getText(scope).replace(/^`|`$/g, "");
      result.slots[name] = type.getText(scope).replace(/\s+/g, " ").trim();
      const leading = scope.text.slice(type.pos, type.typeParameter.getStart(scope));
      const description = comment(type.typeParameter) ?? /\/\*\*([\s\S]*?)\*\//.exec(leading)?.[1]?.replace(/^\s*\*\s?/gm, "").trim();
      if (description) result.slotDescriptions[name] = description;
      return;
    }
    if (!ts.isTypeLiteralNode(type) && !ts.isInterfaceDeclaration(type)) return;
    for (const member of type.members) {
      const name = ts.isIndexSignatureDeclaration(member)
        ? member.parameters[0]?.type?.getText(scope).replace(/^`|`$/g, "")
        : member.name?.getText(scope).replace(/^['"]|['"]$/g, "");
      if (!name) continue;
      result.slots[name] = member.getText(scope).replace(/\s+/g, " ").trim();
      const description = comment(member);
      if (description) result.slotDescriptions[name] = description;
    }
  }
  function literal(node) {
    if (!node) return undefined;
    if (ts.isArrowFunction(node) && !ts.isBlock(node.body)) return literal(node.body);
    if (ts.isStringLiteral(node) || ts.isNumericLiteral(node)) return ts.isNumericLiteral(node) ? Number(node.text) : node.text;
    if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
    if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
    if (node.kind === ts.SyntaxKind.NullKeyword) return null;
    if (ts.isPrefixUnaryExpression(node) && node.operator === ts.SyntaxKind.MinusToken && ts.isNumericLiteral(node.operand))
      return -Number(node.operand.text);
    if (ts.isArrayLiteralExpression(node)) {
      const values = node.elements.map(literal);
      if (values.every((value) => value !== undefined)) return values;
    }
    return undefined;
  }
  function members(type, target) {
    if (!type) return;
    if (ts.isTypeReferenceNode(type)) return members(declarations.get(type.typeName.getText(ast)), target);
    if (ts.isIntersectionTypeNode(type)) {
      for (const item of type.types) members(item, target);
      return;
    }
    if (!ts.isTypeLiteralNode(type) && !ts.isInterfaceDeclaration(type)) return;
    for (const member of type.members) {
      if (ts.isCallSignatureDeclaration(member) && member.parameters.length) {
        const first = member.parameters[0];
        if (first.type && ts.isLiteralTypeNode(first.type) && ts.isStringLiteral(first.type.literal)) {
          const name = first.type.literal.text;
          target[name] = `[${member.parameters.slice(1).map((parameter) => parameter.getText(ast)).join(", ")}]`;
          const description = comment(member);
          if (description && target === result.emits) result.eventDescriptions[name] = description;
        }
        continue;
      }
      if (!member.name || !member.type) continue;
      const name = member.name.getText(ast).replace(/^['"]|['"]$/g, "");
      target[name] = member.type.getText(ast).replace(/\s+/g, " ").trim();
      const description = comment(member);
      if (description && target === result.emits) result.eventDescriptions[name] = description;
      if (target === result.props) {
        if (!member.questionToken) result.required.push(name);
        if (description) result.descriptions[name] = description;
      }
    }
  }
  function comment(member) {
    const sourceFile = member.getSourceFile();
    const comments = (member.jsDoc ?? []).map((doc) => typeof doc.comment === "string" ? doc.comment : "").filter(Boolean);
    const leading = sourceFile.text.slice(member.pos, member.getStart(sourceFile));
    const inline = /\/\*\*([\s\S]*?)\*\//.exec(leading)?.[1]?.replace(/^\s*\*\s?/gm, "").trim();
    return comments.join(" ") || inline;
  }
  function visit(node) {
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression)) {
      const macro = node.expression.text;
      if (macro === "defineProps") members(node.typeArguments?.[0], result.props);
      if (macro === "withDefaults" && node.arguments[1] && ts.isObjectLiteralExpression(node.arguments[1])) {
        for (const property of node.arguments[1].properties) {
          if (!ts.isPropertyAssignment(property)) continue;
          const value = literal(property.initializer);
          if (value !== undefined) result.defaults[property.name.getText(ast).replace(/^['"]|['"]$/g, "")] = value;
        }
      }
      if (macro === "defineSlots") {
        slotMembers(node.typeArguments?.[0]);
      }
      if (macro === "defineEmits") members(node.typeArguments?.[0], result.emits);
      if (macro === "defineModel") {
        const name = node.arguments[0] && ts.isStringLiteral(node.arguments[0]) ? node.arguments[0].text : "modelValue";
        result.models[name] = node.typeArguments?.[0]?.getText(ast) ?? "unknown";
        const options = node.arguments.find(ts.isObjectLiteralExpression);
        const initial = options?.properties.find((property) => ts.isPropertyAssignment(property) && property.name.getText(ast) === "default");
        const initialValue = initial && literal(initial.initializer);
        if (initialValue !== undefined) result.defaults[name] = initialValue;
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(ast);
  return result;
}

export function syncApi(root, check = false) {
  const componentRoot = resolve(root, "packages/ui-kit/src/components");
  const catalog = Object.fromEntries(readdirSync(componentRoot).filter((name) => /^Wl\w+\.vue$/.test(name)).sort()
    .map((name) => [name.slice(0, -4), extractComponentApi(readFileSync(resolve(componentRoot, name), "utf8"), resolve(componentRoot, name))]));
  const target = resolve(root, "packages/ui-kit/src/manifest/api.generated.json");
  const output = JSON.stringify(catalog, null, 2) + "\n";
  if (check) {
    if (readFileSync(target, "utf8").replace(/\r\n/g, "\n") !== output) throw new Error("API metadata is stale; run pnpm api:sync");
  } else writeFileSync(target, output);
  return catalog;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  syncApi(resolve(dirname(fileURLToPath(import.meta.url)), ".."), process.argv.includes("--check"));
}
