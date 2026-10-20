import { existsSync, lstatSync, mkdirSync, readdirSync, readFileSync, realpathSync, unlinkSync, writeFileSync } from "node:fs";
import { basename, dirname, isAbsolute, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const componentCategories = Object.freeze(["actions", "inputs", "data", "containers", "composites", "navigation", "feedback", "misc"]);
const templateRoot = fileURLToPath(new URL("./templates/component/", import.meta.url));

function insertAfter(source, anchor, addition, file) {
  const index = source.indexOf(anchor);
  if (index === -1 || source.indexOf(anchor, index + anchor.length) !== -1) {
    throw new Error(`${file}: expected one stable insertion anchor: ${anchor}`);
  }
  return source.slice(0, index + anchor.length) + addition + source.slice(index + anchor.length);
}

function insertDeclaration(source, declaration, opener, addition, file) {
  const declarationStart = source.indexOf(declaration);
  if (declarationStart === -1 || source.indexOf(declaration, declarationStart + declaration.length) !== -1) {
    throw new Error(`${file}: missing or ambiguous declaration ${declaration}`);
  }
  const start = source.indexOf(opener, declarationStart + declaration.length);
  if (start === -1) throw new Error(`${file}: missing declaration body for ${declaration}`);
  return source.slice(0, start + opener.length) + addition + source.slice(start + opener.length);
}

function safePath(root, file) {
  const target = resolve(root, file);
  const fromRoot = relative(root, target);
  if (!fromRoot || fromRoot.startsWith("..") || isAbsolute(fromRoot)) throw new Error(`Unsafe output path: ${file}`);
  let current = target;
  while (current !== root) {
    let stat;
    try {
      stat = lstatSync(current);
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
    if (stat?.isSymbolicLink()) throw new Error(`Refusing symlink output: ${file}`);
    current = dirname(current);
  }
  return target;
}

/** Compute all outputs before writing; tests use throwaway roots, never the checkout. */
export function createComponentPlan({ root = process.cwd(), name, category, since, reusePt = false } = {}) {
  root = realpathSync(resolve(root));
  if (typeof name !== "string") throw new Error("Provide a PascalCase component name.");
  const componentName = name.startsWith("Wl") ? name : `Wl${name}`;
  if (!/^Wl[A-Z][A-Za-z0-9]*$/.test(componentName)) throw new Error("Use a PascalCase name, with an optional Wl prefix.");
  if (!componentCategories.includes(category)) throw new Error(`Category must be one of: ${componentCategories.join(", ")}`);
  const baseName = componentName.slice(2);
  const slug = baseName.replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2").replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
  const ptKey = baseName.toLowerCase();
  const textKey = `generated${componentName}`;
  const values = { name: componentName, slug, cssClass: `wl-${slug}`, ptKey, textKey };
  const files = new Map();
  const read = (file) => readFileSync(safePath(root, file), "utf8");
  const add = (file, content) => {
    const target = safePath(root, file);
    const directory = dirname(target);
    const collision = existsSync(directory)
      && readdirSync(directory).some((entry) => entry.toLowerCase() === basename(target).toLowerCase());
    if (collision) throw new Error(`Refusing to overwrite existing file: ${file}`);
    files.set(file, { path: file, before: null, content });
  };
  const change = (file, update) => {
    const before = read(file);
    if (new RegExp(`\\b${componentName}\\b`).test(before)) throw new Error(`${file}: ${componentName} is already registered`);
    files.set(file, { path: file, before, content: update(before, file) });
  };
  const template = (file) => readFileSync(resolve(templateRoot, file), "utf8").replace(/\{\{(\w+)\}\}/g, (_match, key) => {
    if (!(key in values)) throw new Error(`Unknown template value: ${key}`);
    return values[key];
  });
  const packageData = JSON.parse(read("packages/ui-kit/package.json"));
  const version = since ?? packageData.version;
  if (!/^\d+\.\d+\.\d+(?:-[0-9A-Z.-]+)?$/i.test(version)) throw new Error("--since must be a semantic version.");

  add(`packages/ui-kit/src/components/${componentName}.vue`, template("component.vue.tpl"));
  add(`packages/ui-kit/tests/components/${componentName}.test.ts`, template("component.test.ts.tpl"));
  add(`apps/playground/src/design-system/examples/${componentName}.vue`, template("example.vue.tpl"));
  const guideGroup = category === "inputs" ? "inputs" : "showcase";
  add(`apps/playground/src/documentation/components/${guideGroup}/${componentName}.vue`, template("guide.vue.tpl"));
  add(`apps/playground/e2e/${slug}.spec.ts`, template("component.spec.ts.tpl"));

  change("packages/ui-kit/src/components/index.ts", (source) => `${source.trimEnd()}\nexport { ${componentName} } from "./native-contracts";\n`);
  change("packages/ui-kit/src/components/native-contracts.ts", (source) => `import Raw${baseName} from "./${componentName}.vue";\n${source.trimEnd()}\nexport const ${componentName} = Raw${baseName} as unknown as WithNativeAttributes<typeof Raw${baseName}, WlElementAttributes>;\n`);
  if (!reusePt) change("packages/ui-kit/src/pt-types.ts", (source, file) => {
    if (new RegExp(`\\b${ptKey}\\s*:`).test(source)) throw new Error(`${file}: pt name ${ptKey} already exists`);
    return insertDeclaration(source, "export interface WlPtMap", "{", `\n  ${ptKey}: Root<TOpen>;`, file);
  });
  else if (!new RegExp(`\\b${ptKey}\\s*:`).test(read("packages/ui-kit/src/pt-types.ts"))) {
    throw new Error(`Cannot reuse missing pt name ${ptKey}`);
  }
  const manifest = {
    name: componentName, category, description: `${componentName} scaffold; complete its behavior before release.`,
    props: [
      { name: "variant", type: "enum", default: "default", values: ["default"] },
      { name: "size", type: "enum", default: "md", values: ["sm", "md", "lg"] },
      { name: "density", type: "enum", default: "default", values: ["default", "compact"] },
      ...["disabled", "invalid", "loading"].map((prop) => ({ name: prop, type: "boolean", default: false })),
      { name: "pt", type: "object", description: "Pass-through attributes for the root section." }
    ],
    slots: [{ name: "default", description: "Content of the component." }], emits: []
  };
  const manifestText = JSON.stringify(manifest, null, 2).split("\n").map((line) => "  " + line).join("\n");
  change(`packages/ui-kit/src/manifest/${category}.ts`, (source, file) =>
    insertAfter(source, "defineComponentManifest([", `\n${manifestText},`, file));
  change("packages/ui-kit/src/manifest/types.ts", (source, file) => insertDeclaration(source, "export const WL_COMPONENT_INTRODUCED_IN", "{", `\n  ${componentName}: ${JSON.stringify(version)},`, file));
  change("packages/ui-kit/styles/base.css", (source) => source.trimEnd() + "\n" + template("component.css.tpl"));

  const registry = `apps/playground/src/documentation/components/${guideGroup}.ts`;
  const prefix = guideGroup === "inputs" ? "input" : "showcase";
  change(registry, (source, file) => {
    const example = JSON.stringify({
      title: `documentation.strings.${textKey}Title`,
      description: `documentation.strings.${textKey}Description`,
      sourceName: `${guideGroup}/${componentName}.vue`
    });
    source = insertDeclaration(source, `export const ${prefix}DocumentationExamples`, "localizeDocumentation({", `\n  ${componentName}: ${example},`, file);
    const rules = ["A11yContent", "A11ySemantics", "A11yKeyboard"].map((suffix) => `documentation.strings.${textKey}${suffix}`);
    return insertDeclaration(source, `export const ${prefix}DocumentationAccessibility`, "localizeDocumentation({",
      `\n  ${componentName}: ${JSON.stringify(rules)},`, file);
  });
  const rootSection = JSON.stringify([{ name: "root", element: "div", description: `documentation.strings.${textKey}Root` }]);
  change("apps/playground/src/documentation/components/pt-sections.ts", (source, file) =>
    insertDeclaration(source, "export const documentationPtSections", "localizeDocumentation({",
      `\n  ${componentName}: ${rootSection},`, file));
  const messages = {
    en: {
      Title: `${componentName}: initial example`, Description: `This is a scaffold for ${componentName}. Complete the component behavior and its examples before release.`,
      Label: `${componentName} content`, Root: "Root container of the component.",
      A11yContent: "Give the completed component meaningful content and an accessible name where required.",
      A11ySemantics: "Choose native semantics that match the implemented behavior before release.",
      A11yKeyboard: "Document and test the completed component's keyboard and focus behavior."
    },
    ru: {
      Title: `${componentName}: первый пример`, Description: `Это заготовка ${componentName}. Перед выпуском добавь поведение компонента и рабочие примеры.`,
      Label: `Содержимое ${componentName}`, Root: "Корневой контейнер компонента.",
      A11yContent: "Добавь понятное содержимое и доступное имя, если оно нужно компоненту.",
      A11ySemantics: "Перед выпуском выбери нативную семантику под поведение компонента.",
      A11yKeyboard: "Опиши и проверь управление с клавиатуры и работу фокуса."
    }
  };
  for (const language of ["en", "ru"]) {
    change(`apps/playground/src/i18n/messages/documentation.${language}.json`, (source, file) => {
      const catalog = JSON.parse(source);
      if (!catalog.strings || Array.isArray(catalog.strings)) throw new Error(`${file}: expected strings object`);
      for (const [suffix, value] of Object.entries(messages[language])) {
        const key = textKey + suffix;
        if (Object.hasOwn(catalog.strings, key)) throw new Error(`${file}: translation key exists: ${key}`);
        catalog.strings[key] = value;
      }
      return JSON.stringify(catalog, null, 2) + "\n";
    });
  }
  return { root, name: componentName, files: [...files.values()] };
}

/** Recheck optimistic snapshots before writing so a stale plan cannot overwrite edits. */
export function applyComponentPlan(plan, { dryRun = false } = {}) {
  for (const file of plan.files) {
    const target = safePath(plan.root, file.path);
    const current = existsSync(target) ? readFileSync(target, "utf8") : null;
    if (current !== file.before) throw new Error(`File changed after planning: ${file.path}`);
  }
  if (dryRun) return plan.files.map((file) => file.path);
  const applied = [];
  try {
    for (const file of plan.files) {
      const target = safePath(plan.root, file.path);
      mkdirSync(dirname(target), { recursive: true });
      applied.push(file);
      writeFileSync(target, file.content, { encoding: "utf8", flag: file.before === null ? "wx" : "w" });
    }
  } catch (error) {
    for (const file of applied.reverse()) {
      const target = safePath(plan.root, file.path);
      if (file.before === null) {
        if (existsSync(target)) unlinkSync(target);
      } else writeFileSync(target, file.before, "utf8");
    }
    throw error;
  }
  return plan.files.map((file) => file.path);
}

export function parseComponentArgs(args) {
  const options = {};
  for (let index = 0; index < args.length; index++) {
    const arg = args[index];
    if (arg === "--dry-run") options.dryRun = true;
    else if (arg === "--reuse-pt") options.reusePt = true;
    else if (["--category", "--root", "--since"].includes(arg)) {
      const value = args[++index];
      if (!value || value.startsWith("--")) throw new Error(`Missing value for ${arg}`);
      options[arg.slice(2)] = value;
    } else if (arg === "--help" || arg === "-h") options.help = true;
    else if (arg.startsWith("-") || options.name) throw new Error(`Unexpected argument: ${arg}`);
    else options.name = arg;
  }
  return options;
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  try {
    const options = parseComponentArgs(process.argv.slice(2));
    if (options.help) console.log("Usage: pnpm new:component <Name> --category <category> [--since <version>] [--reuse-pt] [--dry-run]");
    else {
      const plan = createComponentPlan(options);
      const files = applyComponentPlan(plan, options);
      console.log(`${options.dryRun ? "Would scaffold" : "Scaffolded"} ${plan.name}:\n${files.map((file) => `  ${file}`).join("\n")}`);
      console.log("Complete behavior, TODO tests, examples, release metadata and changeset before review.");
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
