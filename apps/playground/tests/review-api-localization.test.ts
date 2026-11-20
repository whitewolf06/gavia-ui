import type { Plugin } from "vue";
import { mount } from "@vue/test-utils";
import { wlManifest } from "legato-ui";
import { expect, it } from "vitest";
import apiMetadata from "../../../packages/ui-kit/src/manifest/api.generated.json";
import DocumentationContract from "../src/documentation/DocumentationContract.vue";
import { translateDocumentationText } from "../src/documentation/localize";
import { getLocalizedManifest } from "../src/documentation/manifest";
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

it.each([
  { name: "WlSelect", model: "modelValue", literal: "options", value: "[]", optional: "optionValue" },
  { name: "WlDialog", model: "visible", literal: "dismissible", value: "false", optional: "ariaLabel" },
  { name: "WlRadio", model: "modelValue", literal: "disabled", value: "false", optional: "name" }
])("renders model events and distinct default semantics in EN/RU for $name", async (scenario) => {
  const previousLocale = playgroundI18n.global.locale.value;
  const entry = getLocalizedManifest().find((component) => component.name === scenario.name)!;
  const wrapper = mount(DocumentationContract, {
    props: { entry },
    global: { plugins: [playgroundI18n as unknown as Plugin] }
  });
  const defaultCell = (name: string) => wrapper.get(`[data-prop="${name}"]`).findAll("td")[1]!.text();
  try {
    for (const locale of ["en", "ru"] as const) {
      await setPlaygroundLocale(locale);
      const defaults = [
        [scenario.literal, scenario.value],
        [scenario.optional, locale === "en" ? "Not set" : "Не задано"],
        scenario.name === "WlRadio"
          ? ["value", locale === "en" ? "Required" : "Обязательный"]
          : ["motion", locale === "en" ? "Inherits WlConfig.motion" : "Наследует WlConfig.motion"]
      ];
      for (const [name, value] of defaults) expect(defaultCell(name!)).toBe(value);
      expect(entry.props.find((prop) => prop.name === "motion")?.default).toBeUndefined();
      const events = [
        [`update:${scenario.model}`, locale === "en"
          ? "Emitted when the component requests a model change; the payload is the next value."
          : "Компонент запрашивает изменение модели; в событии приходит новое значение."],
        ...(scenario.name === "WlDialog" ? [["open", locale === "en" ? "Dialog fully opened." : "Диалог полностью открылся."]] : [])
      ];
      for (const [name, description] of events) {
        const event = wrapper.findAll("tbody tr").find((row) => row.find("th code").text() === name)!;
        expect(event.findAll("td")[1]!.text()).toBe(description);
      }
    }
  } finally {
    wrapper.unmount();
    await setPlaygroundLocale(previousLocale);
  }
});
