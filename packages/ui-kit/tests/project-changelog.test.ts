// @vitest-environment node
import { readFileSync } from "node:fs";
import { fileURLToPath, URL as NodeURL } from "node:url";
import { describe, expect, it } from "vitest";
import { parseChangelog, parseChangelogInline, resolveChangelogLink } from "../../../apps/playground/src/project/changelog";
import type { ChangelogInline } from "../../../apps/playground/src/project/changelog";
import { gaviaProjectInfo } from "../../../apps/playground/src/project/project-info";

const docsBase = "https://github.com/whitewolf06/gavia-ui/blob/main/";
const text = (content: ChangelogInline[]): string => content.map((part) => part.kind === "link" ? part.label : part.value).join("");

describe("public changelog rendering", () => {
  it("reads the actual history including unreleased, dates, older releases and multiline items", () => {
    const source = readFileSync(fileURLToPath(new NodeURL("../../../CHANGELOG.md", import.meta.url)), "utf8");
    const document = parseChangelog(source, docsBase);
    expect(document.sections[0]).toMatchObject({ title: "Unreleased", id: "project-unreleased", unreleased: true });
    const versions = document.sections.filter((section) => section.version).map((section) => section.version);
    // New releases precede the immutable historical tail; publishing must not drop it.
    expect(versions.slice(versions.indexOf("0.9.1"))).toEqual(["0.9.1", "0.8.1", "0.7.1", "0.7.0", "0.6.0", "0.3.0", "0.2.1", "0.2.0", "0.1.0"]);
    expect(new Set(versions).size).toBe(versions.length);
    expect(document.sections.find((section) => section.version)).toMatchObject({
      version: gaviaProjectInfo.publishedVersion,
      date: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
      id: "project-release-" + gaviaProjectInfo.publishedVersion.replace(/\./g, "-"),
      unreleased: false
    });
    expect(document.sections.find((section) => section.version === "0.9.1"))
      .toMatchObject({ date: "2026-10-07", id: "project-release-0-9-1", unreleased: false });
    const current = document.sections.find((section) => section.version === "0.6.0")!;
    const firstPublic = document.sections.find((section) => section.version === "0.7.0")!;
    expect(firstPublic).toMatchObject({ date: "2026-10-05", id: "project-release-0-7-0", unreleased: false });
    const release = document.sections.find((section) => section.version === "0.8.1")!;
    expect(release).toMatchObject({ date: "2026-10-06", id: "project-release-0-8-1", unreleased: false });
    expect(release.blocks).toEqual(expect.arrayContaining([
      { kind: "heading", content: [{ kind: "text", value: "Fixed" }] },
      expect.objectContaining({ kind: "list", items: expect.arrayContaining([[
        { kind: "code", value: "verify:package" },
        { kind: "text", value: " handles Windows and Linux line endings in LICENSE while comparing license content strictly." }
      ]]) })
    ]));
    const patch = document.sections.find((section) => section.version === "0.7.1")!;
    expect(patch).toMatchObject({ date: "2026-10-05", id: "project-release-0-7-1", unreleased: false });
    expect(patch.blocks.filter((block) => block.kind === "heading").map((block) => text(block.content)))
      .toEqual(["Fixed", "Changed"]);
    const patchBullets = patch.blocks.flatMap((block) => block.kind === "list" ? block.items : []);
    expect(patchBullets.map(text)).toEqual([
      "WlCheckbox checked and indeterminate marks use SVG icons instead of font characters: their shapes and alignment match across three themes.",
      "Disabled WlCheckbox and WlRadio retain their appearance on hover.",
      "WlSelect, WlMultiSelect and WlAutocomplete disclosure arrows use aligned SVG icons instead of text characters.",
      "Removed nine completed HTML prototypes; working examples remain in the Vue playground, and source icons remain in the SVG catalog.",
      "The roadmap and icon instructions link to live SFC examples and the SVG catalog. Prototype history remains in Git. README starts with a prominent link to the public demo."
    ]);
    expect(patchBullets[0]).toContainEqual({ kind: "code", value: "WlCheckbox" });
    expect(patchBullets[1]).toContainEqual({ kind: "code", value: "WlRadio" });
    for (const value of ["WlSelect", "WlMultiSelect", "WlAutocomplete"]) {
      expect(patchBullets[2]).toContainEqual({ kind: "code", value });
    }
    expect(current).toMatchObject({ date: "2026-10-01", id: "project-release-0-6-0", unreleased: false });
    expect(current.blocks.filter((block) => block.kind === "heading").map((block) => text(block.content)))
      .toEqual(["Added", "Changed", "Fixed"]);
    const bullets = firstPublic.blocks.flatMap((block) => block.kind === "list" ? block.items.map(text) : []);
    expect(bullets).toContain("The local preview variable is GAVIA_E2E_BASE_URL; catalog error messages use Gavia UI. The migration lists these changes.");
    expect(bullets).toContain("Public Wl* names, props, events, models, slots, icon names, wl-* classes and --wl-* tokens are preserved.");
    expect(document.sections.some((section) => section.title === "Maintenance rules")).toBe(true);
  });

  it("distinguishes the prepared source version from dated published releases", () => {
    const source = readFileSync(fileURLToPath(new NodeURL("../../../CHANGELOG.md", import.meta.url)), "utf8");
    const document = parseChangelog(source, docsBase);
    const manifest = JSON.parse(readFileSync(fileURLToPath(new NodeURL("../package.json", import.meta.url)), "utf8")) as { version: string };
    expect(gaviaProjectInfo.version).toBe(manifest.version);
    const preparedTitle = `${manifest.version} — prepared`;
    const prepared = document.sections.filter((section) => section.title === preparedTitle);
    if (manifest.version !== gaviaProjectInfo.publishedVersion) {
      expect(prepared).toHaveLength(1);
      expect(document.sections[1]).toBe(prepared[0]);
      expect(prepared[0]).not.toHaveProperty("version");
      expect(prepared[0]).not.toHaveProperty("date");
      expect(prepared[0]!.blocks.length).toBeGreaterThan(0);
      expect(document.sections.some((section) => section.version === manifest.version)).toBe(false);
    } else {
      expect(prepared).toHaveLength(0);
      expect(document.sections.find((section) => section.version)).toMatchObject({
        version: manifest.version, date: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/)
      });
    }
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
    expect(document.sections[0]).toMatchObject({ title: "Не выпущено", id: "project-unreleased", unreleased: true });
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
