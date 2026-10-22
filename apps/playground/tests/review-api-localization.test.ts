import { wlManifest } from "gavia-ui";
import { expect, it } from "vitest";
import apiMetadata from "../../../packages/ui-kit/src/manifest/api.generated.json";
import { translateDocumentationText } from "../src/documentation/localize";
import { ensurePlaygroundMessages, playgroundI18n, playgroundTranslationKey, setPlaygroundLocale } from "../src/i18n";
import { flattenCatalog } from "../src/i18n/catalog";
import english from "../src/i18n/messages/documentation.en.json";
import russian from "../src/i18n/messages/documentation.ru.json";

it("translates all source API prose and new component manifest prose through paired EN/RU reverse aliases", async () => {
  const newComponents = new Set(["WlCheckboxGroup", "WlRadioGroup", "WlToolbar", "WlTagsInput", "WlTooltip", "WlLink", "WlContextMenu"]);
  const sourceProse = Object.values(apiMetadata).flatMap((api) => [
    ...Object.values(api.descriptions), ...Object.values(api.slotDescriptions), ...Object.values(api.eventDescriptions)
  ]);
  for (const entry of wlManifest.filter((component) => newComponents.has(component.name))) {
    sourceProse.push(...[
      entry.description, entry.model?.description,
      ...entry.props.map((prop) => prop.description), ...entry.slots.map((slot) => slot.description),
      ...entry.emits.map((event) => event.description)
    ].filter((text): text is string => Boolean(text)));
  }
  const texts = [...new Set(sourceProse)];
  const catalogs = { en: flattenCatalog(english, "documentation"), ru: flattenCatalog(russian, "documentation") };
  const aliases = new Map(Object.values(catalogs).flatMap((catalog) => Object.entries(catalog).map(([key, text]) => [text, key] as const)));
  const missing = texts.filter((text) => {
    const key = aliases.get(text);
    return !key || !catalogs.en[key]?.trim() || !catalogs.ru[key]?.trim();
  });
  expect(missing).toEqual([]);
  const previousLocale = playgroundI18n.global.locale.value;
  try {
    for (const locale of ["en", "ru"] as const) {
      await ensurePlaygroundMessages(["documentation"], locale);
      await setPlaygroundLocale(locale);
      for (const text of texts) {
        const key = playgroundTranslationKey("documentation", text);
        expect(key, `${locale}: ${text}`).toBe(aliases.get(text));
        expect(translateDocumentationText(text), `${locale}: ${text}`).toBe(catalogs[locale][key!]);
      }
    }
  } finally {
    await setPlaygroundLocale(previousLocale);
  }
});
