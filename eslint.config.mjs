// @ts-check
/** Gavia UI: Vue/TypeScript, accessibility, tests and formatting in one flat config. */
import js from "@eslint/js";
import stylistic from "@stylistic/eslint-plugin";
import vitest from "@vitest/eslint-plugin";
import jsonc from "eslint-plugin-jsonc";
import n from "eslint-plugin-n";
import perfectionist from "eslint-plugin-perfectionist";
import playwright from "eslint-plugin-playwright";
import regexp from "eslint-plugin-regexp";
import unicorn from "eslint-plugin-unicorn";
import unusedImports from "eslint-plugin-unused-imports";
import vue from "eslint-plugin-vue";
import vueA11y from "eslint-plugin-vuejs-accessibility";
import globals from "globals";
import tseslint from "typescript-eslint";

const SRC = ["packages/ui-kit/src/**/*.{ts,vue}"];
const PLAYGROUND = ["apps/playground/src/**/*.{ts,vue}"];
const UNIT_TESTS = ["packages/ui-kit/tests/**/*.{ts,tsx,mjs}", "apps/playground/tests/**/*.{ts,tsx,mjs}"];
const E2E = ["apps/playground/e2e/**/*.ts"];
const SCRIPTS = ["scripts/**/*.mjs", "packages/ui-kit/scripts/**/*.mjs", "apps/playground/build/**/*.ts"];
const CODE = ["**/*.{js,mjs,cjs,ts,mts,tsx,vue}"];

/** ESLint 10 различает языки (JS/JSON): правила кода ограничиваем файлами кода. */
const forCode = (configs) => configs.map((config) => (config.files ? config : { ...config, files: CODE }));

export default tseslint.config(
  {
    name: "gavia/ignores",
    ignores: [
      "**/dist/**",
      "**/coverage/**",
      "**/node_modules/**",
      ".tools/**",
      ".pnpm-store/**",
      ".tmp/**",
      "**/*.generated.*",
      "**/test-results*/**",
      "**/playwright-report/**",
      // Исторические снимки деклараций — неизменяемые фикстуры совместимости.
      "packages/ui-kit/tests/fixtures/**",
      "scripts/fixtures/**",
      "pnpm-lock.yaml",
      "review/drafts/**"
    ]
  },

  ...forCode([
  // --- База JS/TS -----------------------------------------------------------
    {
      name: "gavia/js",
      ...js.configs.recommended,
      languageOptions: { ecmaVersion: "latest", sourceType: "module", globals: { ...globals.browser } }
    },
    ...tseslint.configs.recommended,

    // --- Vue -------------------------------------------------------------------
    ...vue.configs["flat/recommended-error"],
    ...vueA11y.configs["flat/recommended"],
    {
      name: "gavia/vue-prop-defaults",
      rules: { "vue/require-default-prop": "error" }
    },
    {
      name: "gavia/vue",
      files: ["**/*.vue"],
      languageOptions: {
        parserOptions: { parser: tseslint.parser, extraFileExtensions: [".vue"], sourceType: "module" }
      },
      rules: {
        "vue/block-order": ["error", { order: ["script", "template", "style"] }],
        "vue/component-api-style": ["error", ["script-setup"]],
        "vue/define-macros-order": ["error", { order: ["defineOptions", "defineProps", "defineEmits", "defineModel", "defineSlots"] }],
        "vue/no-v-html": "error",
        "vue/multi-word-component-names": "off",
        "vue/require-default-prop": "off", // необязательные props с undefined — осознанный контракт
        "vue/no-unused-refs": "error",
        "vue/no-useless-v-bind": "error",
        "vue/prefer-separate-static-class": "error",
        "vue/html-self-closing": ["error", { html: { void: "always", normal: "never", component: "always" } }],
        "vue/max-attributes-per-line": ["error", { singleline: 3, multiline: 1 }],
        "vue/first-attribute-linebreak": "error",
        "vue/padding-line-between-blocks": "error",
        // Как у antfu: не заставлять переносить короткое содержимое тегов на отдельные строки.
        "vue/singleline-html-element-content-newline": "off",
        "vue/multiline-html-element-content-newline": "off",
        // a11y: компоненты библиотеки сами передают роли/aria — ослабляем то, что даёт ложные срабатывания на обёртках.
        "vuejs-accessibility/no-static-element-interactions": "error",
        "vuejs-accessibility/click-events-have-key-events": "error",
        "vuejs-accessibility/label-has-for": ["error", { required: { some: ["nesting", "id"] }, allowChildren: true }]
      }
    },

    // --- Стиль (вместо Prettier) ---------------------------------------------
    stylistic.configs.customize({
      indent: 2,
      quotes: "double",
      semi: true,
      commaDangle: "never",
      braceStyle: "1tbs",
      arrowParens: true,
      quoteProps: "as-needed",
      jsx: true
    }),
    {
      name: "gavia/stylistic-extra",
      rules: {
        "@stylistic/quotes": ["error", "double", { avoidEscape: true }],
        "vue/no-template-shadow": "error",
        "vue/one-component-per-file": "error",
        "@stylistic/max-statements-per-line": ["error", { max: 1 }],
        "@stylistic/max-len": ["warn", {
          code: 140,
          ignoreUrls: true,
          ignoreStrings: true,
          ignoreTemplateLiterals: true,
          ignoreRegExpLiterals: true
        }],
        "@stylistic/operator-linebreak": ["error", "before"],
        // Keep literal payloads identical in both length rules, including generated fixtures.
        "vue/max-len": ["warn", {
          code: 140,
          template: 140,
          ignoreUrls: true,
          ignoreStrings: true,
          ignoreTemplateLiterals: true,
          ignoreHTMLAttributeValues: true
        }]
      }
    },

    // --- Импорты ---------------------------------------------------------------
    {
      name: "gavia/imports",
      plugins: { perfectionist, "unused-imports": unusedImports },
      rules: {
        "perfectionist/sort-imports": ["error", { type: "natural", newlinesBetween: "ignore" }],
        "perfectionist/sort-named-imports": ["error", { type: "natural" }],
        "perfectionist/sort-named-exports": ["error", { type: "natural" }],
        "@typescript-eslint/no-unused-vars": "off",
        "unused-imports/no-unused-imports": "error",
        "unused-imports/no-unused-vars": ["error", { args: "after-used", argsIgnorePattern: "^_", varsIgnorePattern: "^_|^CallbackInference$" }],
        "@typescript-eslint/consistent-type-imports": ["error", { prefer: "type-imports", fixStyle: "inline-type-imports" }]
      }
    },

    // --- Общая гигиена ------------------------------------------------------------
    regexp.configs["flat/recommended"],
    {
      name: "gavia/hygiene",
      plugins: { unicorn },
      rules: {
        eqeqeq: ["error", "smart"],
        "no-console": ["error", { allow: ["warn", "error"] }],
        "prefer-const": "error",
        "object-shorthand": "error",
        "@typescript-eslint/no-explicit-any": "error",
        "@typescript-eslint/no-empty-object-type": ["error", { allowObjectTypes: "always" }],
        "@typescript-eslint/no-non-null-assertion": "off", // noUncheckedIndexedAccess делает `!` осознанным
        "unicorn/prefer-node-protocol": "error",
        "unicorn/no-useless-spread": "error",
        // prefer-string-replace-all не включаем: lib/target ES2020, replaceAll — ES2021 (автофикс ломает typecheck).
        "unicorn/prefer-array-some": "error",
        "unicorn/no-instanceof-array": "error",
        "unicorn/throw-new-error": "error"
      }
    },

    // --- Библиотека: правила из agents.md ---------------------------------------
    {
      name: "gavia/ui-kit-boundaries",
      files: SRC,
      rules: {
        "no-restricted-imports": ["error", {
          patterns: [
            { group: ["@/*"], message: "agents.md §5: внутри packages/ui-kit только относительные импорты." },
            { group: ["primevue", "primevue/*", "primeicons"], message: "agents.md §2: PrimeVue запрещён." },
            { group: ["**/apps/**"], message: "Библиотека не импортирует код приложений." }
          ]
        }],
        // Библиотечные поля получают подпись от потребителя (WlField/aria-*), правило даёт ложные срабатывания.
        "vuejs-accessibility/form-control-has-label": "off"
      }
    },
    {
    // Эвристика «нет DOM при импорте модуля» (agents.md §4) — только для .ts-модулей:
    // верхний уровень <script setup> выполняется в setup(), а не при импорте.
      name: "gavia/ui-kit-no-dom-on-import",
      files: ["packages/ui-kit/src/**/*.ts"],
      rules: {
        "no-restricted-syntax": ["error",
          {
            selector: "Program > ExpressionStatement > :matches(MemberExpression, CallExpression > MemberExpression.callee)[object.name=/^(window|document|navigator|localStorage)$/]",
            message: "agents.md §4: не обращаться к DOM при импорте модуля — только в хуках/обработчиках."
          },
          {
            selector: "Program > VariableDeclaration > VariableDeclarator > :matches(MemberExpression, CallExpression > MemberExpression.callee)[object.name=/^(window|document|navigator|localStorage)$/]",
            message: "agents.md §4: не обращаться к DOM при импорте модуля — только в хуках/обработчиках."
          }
        ]
      }
    },
    {
    // Импорты Teleport/Transition из utils/template*.vue (обход Volar для generic SFC) совпадают с именами
    // встроенных компонентов, и vue-eslint-parser не считает их использованными в шаблоне:
    // автофикс unused-imports удалил бы их и сломал typecheck. Лучше переименовать в WlTeleport/WlTransition.
      name: "gavia/volar-builtin-reexports",
      files: ["packages/ui-kit/src/components/WlAutocomplete.vue", "packages/ui-kit/src/components/WlDatePicker.vue"],
      rules: { "unused-imports/no-unused-imports": "off" }
    },
    {
      name: "gavia/icon-v-html",
      files: ["packages/ui-kit/src/components/WlIcon.vue"],
      rules: { "vue/no-v-html": "off" } // SVG из собственного проверенного каталога (icons:check)
    },

    // --- Playground ------------------------------------------------------------------
    {
      name: "gavia/playground",
      files: PLAYGROUND,
      rules: {
        "no-restricted-imports": ["error", {
          patterns: [{ group: ["**/packages/ui-kit/src/**"], message: "Импортируйте библиотеку как \"gavia-ui\" (alias на src в vite.config)." }]
        }]
      }
    },

    // --- Unit-тесты ------------------------------------------------------------
    {
      name: "gavia/unit-tests",
      files: UNIT_TESTS,
      plugins: { vitest },
      languageOptions: { globals: { ...globals.node } },
      rules: {
        ...vitest.configs.recommended.rules,
        "vitest/valid-expect": ["error", { maxArgs: 2 }],
        "vitest/no-focused-tests": "error",
        "vitest/no-disabled-tests": "error",
        // Render-function fixtures intentionally compose several local test components.
        "vue/one-component-per-file": "off",
        "vitest/expect-expect": ["error", { assertFunctionNames: ["expect", "expectTypeOf", "assert*"] }]
      }
    },

    // --- E2E (Playwright) -------------------------------------------------------
    {
      name: "gavia/e2e",
      ...playwright.configs["flat/recommended"],
      files: E2E,
      // Preserve the preset's rule set while enforcing its non-formatting warnings.
      rules: Object.fromEntries(Object.entries(playwright.configs["flat/recommended"].rules)
        .map(([name, setting]) => [name, setting === "warn" ? "error" : setting]))
    },
    {
      name: "gavia/e2e-extra",
      files: E2E,
      rules: {
        "playwright/no-wait-for-timeout": "error",
        "playwright/no-force-option": "error",
        "playwright/expect-expect": ["error", { assertFunctionNames: ["expectPreferences"] }],
        "playwright/no-conditional-expect": "error",
        "playwright/no-skipped-test": "error",
        "playwright/prefer-hooks-on-top": "error",
        // Автофикс этого правила меняет смысл кода (переменная с ID превращается в локатор) —
        // включать отдельно и править вручную, после первого форматирующего прохода.
        "playwright/prefer-web-first-assertions": "off",
        "playwright/no-conditional-in-test": "error"
      }
    },

    // --- Node-скрипты ------------------------------------------------------------
    {
      name: "gavia/scripts",
      ...n.configs["flat/recommended-module"],
      files: SCRIPTS
    },
    {
      name: "gavia/scripts-extra",
      files: SCRIPTS,
      settings: { n: { tryExtensions: [".js", ".mjs", ".json", ".ts", ".mts"] } },
      languageOptions: { globals: { ...globals.node } },
      rules: {
        "no-console": "off",
        "n/no-process-exit": "off",
        "n/no-unpublished-import": "off"
      }
    }
  ]),

  // --- JSON ---------------------------------------------------------------------
  ...jsonc.configs["flat/recommended-with-json"],
  {
    name: "gavia/package-json",
    files: ["**/package.json"],
    rules: {
      "jsonc/sort-keys": ["error",
        {
          pathPattern: "^$",
          order: [
            "name", "version", "private", "description", "type", "license", "author", "homepage",
            "repository", "bugs", "keywords", "packageManager", "engines", "sideEffects", "exports",
            "main", "module", "types", "files", "scripts", "peerDependencies", "dependencies",
            "devDependencies", "pnpm", "publishConfig"
          ]
        },
        { pathPattern: "^(?:dev|peer)?[Dd]ependencies$", order: { type: "asc" } }
      ]
    }
  },
  {
    // Словари i18n: одинаковая структура en/ru проверяется тестами; здесь — только синтаксис и дубли.
    name: "gavia/i18n-json",
    files: ["apps/playground/src/i18n/messages/*.json"],
    rules: { "jsonc/no-dupe-keys": "error" }
  }
);
