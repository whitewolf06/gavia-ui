import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { defineComponent, nextTick } from "vue";
import { useWlRovingFocus, useWlTypeahead } from "../src/composables";

describe("public keyboard helpers", () => {
  it("buffers prefixes, cycles repeated letters, skips disabled matches and clears timers on disposal", async () => {
    vi.useFakeTimers();
    const labels = ["Alpha", "Alpine", "Apricot", "Beta"];
    let active = 0;
    let keyboard!: ReturnType<typeof useWlTypeahead>;
    const wrapper = mount(defineComponent({
      setup() {
        keyboard = useWlTypeahead({
          count: () => labels.length, label: (index) => labels[index]!, active: () => active,
          isDisabled: (index) => index === 1, onMatch: (index) => {
            active = index;
          }
        });
        return () => null;
      }
    }));
    const key = (value: string) => keyboard.onKeydown(new KeyboardEvent("keydown", { key: value, cancelable: true }));
    key("a");
    expect(active).toBe(2);
    key("a");
    expect(active).toBe(0);
    keyboard.reset();
    key("b");
    expect(active).toBe(3);
    await vi.advanceTimersByTimeAsync(500);
    key("a");
    key("p");
    expect(active).toBe(2);
    wrapper.unmount();
    expect(vi.getTimerCount()).toBe(0);
    vi.useRealTimers();
  });

  it("leaves editable typing alone", () => {
    let keyboard!: ReturnType<typeof useWlTypeahead>;
    const onMatch = vi.fn();
    const wrapper = mount(defineComponent({ setup() {
      keyboard = useWlTypeahead({ count: () => 1, label: () => "Alpha", active: () => 0, onMatch });
      return () => null;
    } }));
    const input = document.createElement("input");
    input.addEventListener("keydown", keyboard.onKeydown);
    const event = new KeyboardEvent("keydown", { key: "a", cancelable: true });
    input.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
    expect(onMatch).not.toHaveBeenCalled();
    wrapper.unmount();
  });

  it("keeps focus at boundaries when loop is false and supports reactive loop changes", async () => {
    let loop = false;
    let keyboard!: ReturnType<typeof useWlRovingFocus>;
    const focus = vi.fn();
    const wrapper = mount(defineComponent({ setup() {
      keyboard = useWlRovingFocus({ count: () => 3, isDisabled: (index) => index === 1, focus, orientation: "horizontal", loop: () => loop });
      return () => null;
    } }));
    const key = (value: string) => keyboard.onKeydown(new KeyboardEvent("keydown", { key: value, cancelable: true }));
    key("ArrowLeft");
    await nextTick();
    expect(keyboard.active.value).toBe(0);
    expect(focus).not.toHaveBeenCalled();
    key("ArrowRight");
    await nextTick();
    expect(focus).toHaveBeenLastCalledWith(2);
    key("ArrowRight");
    await nextTick();
    expect(keyboard.active.value).toBe(2);
    loop = true;
    key("ArrowRight");
    await nextTick();
    expect(focus).toHaveBeenLastCalledWith(0);
    wrapper.unmount();
  });
});
