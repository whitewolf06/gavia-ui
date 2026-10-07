import { createSSRApp, h, ref } from "vue";
import { WlButton, WlConfig, WlDatePicker, WlField, WlInput, WlSelect, wlLocaleRu } from "gavia-ui";

// The same render function and initial state run in native Node and the browser.
export const PackedFixture = {
  name: "PackedFixture",
  setup() {
    const count = ref(0);
    const name = ref("Gavia");
    const material = ref("wood");
    const date = ref("2026-10-01");
    return () => h("main", { id: "packed-fixture", style: { padding: "16px", maxWidth: "720px", margin: "0 auto", display: "grid", gap: "16px" } }, [
      h("h1", "Packed Gavia UI consumer"),
      h(WlField, { label: "Имя", hint: "Сервер и браузер используют одинаковое состояние." }, {
        default: (field) => h(WlInput, {
          id: field.id, "aria-describedby": field.ariaDescribedby,
          modelValue: name.value, "onUpdate:modelValue": (value) => { name.value = value; }
        })
      }),
      h("output", { "data-testid": "name-value" }, name.value),
      h(WlField, { label: "Материал", hint: "Выберите материал." }, {
        default: (field) => h(WlSelect, {
          id: field.id, "aria-labelledby": undefined, "aria-label": "Материал",
          "aria-describedby": field.ariaDescribedby, motion: false,
          options: [{ label: "Дерево", value: "wood" }, { label: "Металл", value: "metal" }],
          optionLabel: "label", optionValue: "value",
          modelValue: material.value, "onUpdate:modelValue": (value) => { material.value = value; }
        })
      }),
      h("output", { "data-testid": "material-value" }, String(material.value)),
      h(WlDatePicker, {
        "aria-label": "Дата", modelValue: date.value, motion: false,
        "onUpdate:modelValue": (value) => { date.value = value; }
      }),
      h(WlButton, { variant: "primary", onClick: () => { count.value += 1; } }, {
        default: () => "Увеличить"
      }),
      h("output", { "data-testid": "click-count", "aria-live": "polite" }, String(count.value))
    ]);
  }
};

export function createPackedSSRApp() {
  const app = createSSRApp(PackedFixture);
  app.config.idPrefix = "packed";
  app.use(WlConfig, { locale: wlLocaleRu, motion: false });
  return app;
}

