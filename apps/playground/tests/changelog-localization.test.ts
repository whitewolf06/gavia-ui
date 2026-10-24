import { afterAll, describe, expect, it } from "vitest";
import source from "../../../CHANGELOG.md?raw";
import { ensurePlaygroundMessages, setPlaygroundLocale } from "../src/i18n";
import type { ChangelogDocument, ChangelogInline } from "../src/project/changelog";
import { parseChangelog } from "../src/project/changelog";
import { localizeChangelogMarkdown } from "../src/project/changelog-localization";

const docsBase = "https://github.com/whitewolf06/gavia-ui/blob/main/";
const text = (content: ChangelogInline[]): string => content.map((part) => part.kind === "link" ? part.label : part.value).join("");
const prose = (document: ChangelogDocument): string[] => [
  ...document.introduction,
  ...document.sections.flatMap((section) => section.blocks)
].flatMap((block) => block.kind === "list" ? block.items.map(text) : [text(block.content)]);

afterAll(async () => {
  await setPlaygroundLocale("en");
});

describe("localized public changelog", () => {
  it("translates every visible prose block in the real history and keeps release links stable", async () => {
    await ensurePlaygroundMessages(["changelog"], "ru");
    await setPlaygroundLocale("ru");
    const russian = parseChangelog(localizeChangelogMarkdown(source), docsBase);
    const english = parseChangelog(source, docsBase);
    const identity = ({ id, version, date, unreleased }: ChangelogDocument["sections"][number]) => ({ id, version, date, unreleased });

    expect(russian.sections.map(identity)).toEqual(english.sections.map(identity));
    expect(russian.sections[0]!.title).toBe("Не выпущено");
    expect(prose(russian).length).toBe(prose(english).length);
    for (const value of prose(russian)) {
      expect(value, "Missing Russian changelog translation: " + value).toMatch(/[А-Яа-яЁё]/);
    }
    const stable = russian.sections.find((section) => section.version === "1.0.0")!;
    expect(prose({ introduction: [], sections: [stable] }).join(" ")).toContain("вся история обновлений в Playground теперь переведена на русский");
  });

  it("preserves the original English history after changing language", async () => {
    await ensurePlaygroundMessages(["changelog"], "ru");
    await setPlaygroundLocale("ru");
    expect(localizeChangelogMarkdown(source)).not.toBe(source);
    await setPlaygroundLocale("en");
    expect(localizeChangelogMarkdown(source)).toBe(source);
  });
});
