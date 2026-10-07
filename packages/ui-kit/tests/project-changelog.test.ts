// @vitest-environment node
import { readFileSync } from "node:fs";
import { fileURLToPath, URL as NodeURL } from "node:url";
import { describe, expect, it } from "vitest";
import { parseChangelog, parseChangelogInline, resolveChangelogLink } from "../../../apps/playground/src/project/changelog";
import type { ChangelogInline } from "../../../apps/playground/src/project/changelog";

const docsBase = "https://github.com/whitewolf06/gavia-ui/blob/main/";
const text = (content: ChangelogInline[]): string => content.map((part) => part.kind === "link" ? part.label : part.value).join("");

describe("public changelog rendering", () => {
  it("reads the actual history including unreleased, dates, older releases and multiline items", () => {
    const source = readFileSync(fileURLToPath(new NodeURL("../../../CHANGELOG.md", import.meta.url)), "utf8");
    const document = parseChangelog(source, docsBase);
    expect(document.sections[0]).toMatchObject({ title: "Не выпущено", id: "project-unreleased", unreleased: true });
    const versions = document.sections.filter((section) => section.version).map((section) => section.version);
    expect(versions).toEqual(["0.9.1", "0.8.1", "0.7.1", "0.7.0", "0.6.0", "0.3.0", "0.2.1", "0.2.0", "0.1.0"]);
    expect(document.sections.find((section) => section.version === "0.9.1"))
      .toMatchObject({ date: "2026-10-07", id: "project-release-0-9-1", unreleased: false });
    const current = document.sections.find((section) => section.version === "0.6.0")!;
    const firstPublic = document.sections.find((section) => section.version === "0.7.0")!;
    expect(firstPublic).toMatchObject({ date: "2026-10-05", id: "project-release-0-7-0", unreleased: false });
    const release = document.sections.find((section) => section.version === "0.8.1")!;
    expect(release).toMatchObject({ date: "2026-10-06", id: "project-release-0-8-1", unreleased: false });
    expect(release.blocks).toEqual(expect.arrayContaining([
      { kind: "heading", content: [{ kind: "text", value: "Исправлено" }] },
      expect.objectContaining({ kind: "list", items: expect.arrayContaining([[
        { kind: "text", value: "Проверка " },
        { kind: "code", value: "verify:package" },
        { kind: "text", value: " учитывает переносы строк Windows и Linux в LICENSE, сохраняя строгое сравнение содержания лицензии." }
      ]]) })
    ]));
    const patch = document.sections.find((section) => section.version === "0.7.1")!;
    expect(patch).toMatchObject({ date: "2026-10-05", id: "project-release-0-7-1", unreleased: false });
    expect(patch.blocks.filter((block) => block.kind === "heading").map((block) => text(block.content)))
      .toEqual(["Исправлено", "Изменено"]);
    const patchBullets = patch.blocks.flatMap((block) => block.kind === "list" ? block.items : []);
    expect(patchBullets.map(text)).toEqual([
      "Отметки WlCheckbox в состояниях checked и indeterminate используют SVG-иконки вместо символов шрифта: рисунок и выравнивание одинаковы в трёх темах.",
      "Отключённые WlCheckbox и WlRadio сохраняют своё оформление при наведении.",
      "Стрелки раскрытия WlSelect, WlMultiSelect и WlAutocomplete заменены SVG-иконками с единым выравниванием вместо текстовых символов.",
      "Удалены девять завершённых HTML-прототипов; рабочие примеры остаются в Vue-витрине, а исходные иконки — в SVG-каталоге.",
      "Дорожная карта и инструкции по добавлению иконок ссылаются на живые SFC-примеры и SVG-каталог. История прототипов сохранена в Git. В начале README размещена заметная ссылка на публичную демо-витрину."
    ]);
    expect(patchBullets[0]).toContainEqual({ kind: "code", value: "WlCheckbox" });
    expect(patchBullets[1]).toContainEqual({ kind: "code", value: "WlRadio" });
    for (const value of ["WlSelect", "WlMultiSelect", "WlAutocomplete"]) {
      expect(patchBullets[2]).toContainEqual({ kind: "code", value });
    }
    expect(current).toMatchObject({ date: "2026-10-01", id: "project-release-0-6-0", unreleased: false });
    expect(current.blocks.filter((block) => block.kind === "heading").map((block) => text(block.content)))
      .toEqual(["Добавлено", "Изменено", "Исправлено"]);
    const bullets = firstPublic.blocks.flatMap((block) => block.kind === "list" ? block.items.map(text) : []);
    expect(bullets).toContain("Переменная локального стенда — GAVIA_E2E_BASE_URL; тексты ошибок каталога используют Gavia UI. Изменения перечислены в миграции.");
    expect(bullets).toContain("Публичные Wl*, props, события, модели, слоты, имена иконок, классы wl-* и токены --wl-* сохраняются.");
    expect(document.sections.some((section) => section.title === "Правила ведения")).toBe(true);
  });

  it("keeps exact inline text and code while resolving documentation links canonically", () => {
    expect(parseChangelogInline("До `Wl*` и [миграции](docs/migration-gavia.md#imports).", docsBase)).toEqual([
      { kind: "text", value: "До " },
      { kind: "code", value: "Wl*" },
      { kind: "text", value: " и " },
      { kind: "link", label: "миграции", href: `${docsBase}docs/migration-gavia.md#imports` },
      { kind: "text", value: "." }
    ]);
  });

  it("does not turn HTML, scripts, credentials or repository traversal into executable markup", () => {
    const source = '<img src=x onerror=alert(1)> [опасно](javascript:alert) и `<script>`';
    const parts = parseChangelogInline(source, docsBase);
    expect(parts.some((part) => part.kind === "link")).toBe(false);
    expect(text(parts)).toBe('<img src=x onerror=alert(1)> [опасно](javascript:alert) и <script>');
    for (const unsafe of [
      "javascript:alert(1)", "data:text/html,test", "//evil.example/path",
      "docs/../LICENSE", "docs/%2e%2e/secret.md", "docs/%5csecret.md",
      "https://user:password@example.com", "docs/bad\u0000.md", "docs/invalid%zz.md"
    ]) expect(resolveChangelogLink(unsafe, docsBase), unsafe).toBeUndefined();
    expect(resolveChangelogLink("https://github.com/whitewolf06", docsBase)).toBe("https://github.com/whitewolf06");
  });

  it("preserves paragraph/list boundaries, CRLF and the final item without a trailing blank line", () => {
    const document = parseChangelog("# Changelog\r\n\r\nОписание\r\nпродолжение\r\n\r\n## Не выпущено\r\n- Первый\r\n  пункт\r\n- Второй\r\n\r\nПояснение\r\n\r\n### Исправлено\r\n- Последний", docsBase);
    expect(document.introduction).toEqual([{ kind: "paragraph", content: [{ kind: "text", value: "Описание продолжение" }] }]);
    expect(document.sections[0]!.blocks).toEqual([
      { kind: "list", items: [[{ kind: "text", value: "Первый пункт" }], [{ kind: "text", value: "Второй" }]] },
      { kind: "paragraph", content: [{ kind: "text", value: "Пояснение" }] },
      { kind: "heading", content: [{ kind: "text", value: "Исправлено" }] },
      { kind: "list", items: [[{ kind: "text", value: "Последний" }]] }
    ]);
  });

  it("keeps anchors unique when a maintainer repeats a version heading", () => {
    const { sections } = parseChangelog("## 0.6.0 — 2026-10-01\n- A\n## 0.6.0 — 2026-10-01\n- B", docsBase);
    expect(new Set(sections.map((section) => section.id)).size).toBe(2);
    expect(sections[0]!.id).toBe("project-release-0-6-0");
  });
});
