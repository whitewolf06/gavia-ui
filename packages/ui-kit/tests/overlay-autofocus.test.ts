import { afterEach, describe, expect, it } from "vitest";
import { defineComponent, nextTick, ref, type Component } from "vue";
import { mount, type VueWrapper } from "@vue/test-utils";
import { WlDialog, WlDrawer, WlInput } from "../src";
import { useOverlayLifecycle } from "../src/utils/overlayLifecycle";

const wrappers: VueWrapper[] = [];

afterEach(() => {
  wrappers.splice(0).forEach((wrapper) => wrapper.unmount());
  document.body.replaceChildren();
  document.body.style.overflow = "";
});

async function openOverlay(component: Component, content: string) {
  const Harness = defineComponent({
    components: { Overlay: component, WlInput },
    setup: () => ({ visible: ref(false) }),
    template: `
      <button data-opener @click="visible = true">Открыть редактор</button>
      <Overlay v-model:visible="visible" header="Редактор" :motion="false">
        ${content}
        <template #footer><button>Сохранить</button></template>
      </Overlay>
    `
  });
  const wrapper = mount(Harness, { attachTo: document.body });
  wrappers.push(wrapper);
  const opener = wrapper.get<HTMLButtonElement>("[data-opener]");
  opener.element.focus();
  await opener.trigger("click");
  await nextTick();
  await nextTick();
  const overlay = document.body.querySelector<HTMLElement>('[role="dialog"]')!;
  const close = overlay.querySelector<HTMLButtonElement>('button[aria-label="Закрыть"]')!;
  return { wrapper, opener: opener.element, overlay, close };
}

describe("overlay autofocus lifecycle", () => {
  it.each([
    ["Dialog", WlDialog],
    ["Drawer", WlDrawer]
  ] as const)("focuses the autofocus title before Close in %s and returns to the opener", async (_, component) => {
    const { opener, overlay, close } = await openOverlay(component, `
      <input autofocus disabled aria-label="Недоступное поле" />
      <WlInput id="title" autofocus aria-label="Заголовок" />
    `);
    const title = overlay.querySelector<HTMLInputElement>("#title")!;
    expect(close.compareDocumentPosition(title) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(document.activeElement).toBe(title);
    expect(document.body.style.overflow).toBe("hidden");

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await nextTick();
    await nextTick();
    expect(document.body.querySelector('[role="dialog"]')).toBeNull();
    expect(document.activeElement).toBe(opener);
    expect(document.body.style.overflow).toBe("");
  });

  it.each([
    ["disabled", '<input autofocus disabled />'],
    ["disabled with an explicit tab stop", '<input autofocus disabled tabindex="0" />'],
    ["hidden", '<input autofocus hidden />'],
    ["inside a hidden ancestor", '<div hidden><input autofocus /></div>'],
    ["inside an inert ancestor", '<div inert><input autofocus /></div>'],
    ["aria-hidden", '<input autofocus aria-hidden="true" />'],
    ["inside an aria-hidden ancestor", '<div aria-hidden="true"><input autofocus /></div>'],
    ["display none", '<input autofocus style="display: none" />'],
    ["inside a display-none ancestor", '<div style="display: none"><input autofocus /></div>'],
    ["visibility hidden", '<input autofocus style="visibility: hidden" />'],
    ["inside a visibility-hidden ancestor", '<div style="visibility: hidden"><input autofocus /></div>'],
    ["hidden input type", '<input autofocus type="hidden" />'],
    ["excluded from keyboard navigation", '<input autofocus tabindex="-1" />'],
    ["not focusable", '<div autofocus>Заголовок</div>']
  ])("ignores an autofocus candidate that is %s and keeps Close as the fallback", async (_, content) => {
    const { close } = await openOverlay(WlDialog, content);
    expect(document.activeElement).toBe(close);
  });

  it("keeps Close as the initial target when the content does not request autofocus", async () => {
    const { close } = await openOverlay(WlDialog, '<WlInput aria-label="Заголовок" />');
    expect(document.activeElement).toBe(close);
  });

  it("preserves an explicit initial focus policy even when a title requests autofocus", async () => {
    const Harness = defineComponent({
      setup() {
        const visible = ref(false);
        const container = ref<HTMLElement | null>(null);
        const preferred = ref<HTMLInputElement | null>(null);
        useOverlayLifecycle({ visible, container, initialFocus: () => preferred.value });
        return { visible, container, preferred };
      },
      template: `
        <button data-opener @click="visible = true">Открыть</button>
        <section v-if="visible" ref="container" tabindex="-1">
          <button>Закрыть</button>
          <input autofocus aria-label="Заголовок" />
          <input ref="preferred" tabindex="-1" aria-label="Явная цель" />
        </section>
      `
    });
    const wrapper = mount(Harness, { attachTo: document.body });
    wrappers.push(wrapper);
    const opener = wrapper.get<HTMLButtonElement>("[data-opener]");
    opener.element.focus();
    await opener.trigger("click");
    await nextTick();
    await nextTick();
    expect(document.activeElement).toBe(wrapper.get('[aria-label="Явная цель"]').element);
  });
});
