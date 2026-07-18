import { describe, it, expect } from "vitest";
import { mount, type GlobalMountOptions } from "@vue/test-utils";
import PrimeVue from "primevue/config";
import { WlInput, WlNumberInput, WlPasswordInput, WlStatCard, WlTable, WlTextarea, createWlPt } from "../src";
import type { WlTableColumn, WlTableRow } from "../src";

// Wire the kit pt map like a real app, so DataTable sections get wl-* classes.
const global: GlobalMountOptions = {
  plugins: [[PrimeVue, { unstyled: true, pt: createWlPt() }]]
};

const columns: WlTableColumn[] = [
  { key: "task", label: "Задача" },
  { key: "project", label: "Проект" },
  { key: "status", label: "Статус" },
  { key: "estimate", label: "Оценка", numeric: true }
];

const rows: WlTableRow[] = [
  { task: "Черновик презентации «Атлас»", project: "Атлас", status: "В работе", estimate: "3 ч" },
  { task: "Ревью макетов онбординга", project: "Атлас", status: "Черновик", estimate: "1 ч" },
  { task: "Отправить отчёт за июнь", project: "Работа", status: "Готово", estimate: "2 ч" }
];

describe("WlTable", () => {
  it("renders headers and rows from the columns prop", () => {
    const wrapper = mount(WlTable, { global, props: { value: rows, columns } });
    expect(wrapper.find('[data-wl="table"]').exists()).toBe(true);

    const headers = wrapper.findAll("th");
    expect(headers).toHaveLength(4);
    expect(headers.map((th) => th.text())).toEqual(["Задача", "Проект", "Статус", "Оценка"]);

    const bodyRows = wrapper.findAll(".wl-table__row");
    expect(bodyRows).toHaveLength(3);
    expect(bodyRows[0]!.text()).toContain("Черновик презентации «Атлас»");
    expect(bodyRows[2]!.text()).toContain("Отправить отчёт за июнь");
  });

  it("marks numeric columns on both th and td", () => {
    const wrapper = mount(WlTable, { global, props: { value: rows, columns } });
    const numericCells = wrapper.findAll(".wl-table__cell--num");
    // 1 header + 3 body cells
    expect(numericCells).toHaveLength(4);
    expect(numericCells[0]!.element.tagName).toBe("TH");
    expect(wrapper.findAll("td.wl-table__cell--num")).toHaveLength(3);
  });

  it("renders a scoped cell slot override with row and value", () => {
    const wrapper = mount(WlTable, {
      global,
      props: { value: rows, columns },
      slots: {
        "cell-status": `<template #cell-status="{ row, value }"><span class="st">{{ value }}@{{ row.project }}</span></template>`
      }
    });
    const custom = wrapper.findAll(".st");
    expect(custom).toHaveLength(3);
    expect(custom[0]!.text()).toBe("В работе@Атлас");
  });

  it("shows the empty message when there are no rows", () => {
    const wrapper = mount(WlTable, { global, props: { value: [], columns } });
    const empty = wrapper.find(".wl-table__empty-cell");
    expect(empty.exists()).toBe(true);
    expect(empty.text()).toBe("Нет данных");
  });

  it("honors a custom emptyMessage", () => {
    const wrapper = mount(WlTable, {
      global,
      props: { value: [], columns, emptyMessage: "Задач пока нет" }
    });
    expect(wrapper.find(".wl-table__empty-cell").text()).toBe("Задач пока нет");
  });

  it("shows the loading mask", () => {
    const wrapper = mount(WlTable, { global, props: { value: rows, columns, loading: true } });
    expect(wrapper.find(".wl-table__mask").exists()).toBe(true);
  });
});

describe("WlStatCard", () => {
  it("renders icon, label, value and description", () => {
    const wrapper = mount(WlStatCard, {
      global,
      props: { icon: "check", label: "Время сегодня", value: "4 ч 12 мин", description: "из дневной цели 6 часов" }
    });
    expect(wrapper.find('[data-wl="stat-card"]').exists()).toBe(true);
    expect(wrapper.find(".wl-stat-card__label").text()).toContain("Время сегодня");
    expect(wrapper.find(".wl-stat-card__label .wl-icon").exists()).toBe(true);
    expect(wrapper.find(".wl-stat-card__value").text()).toBe("4 ч 12 мин");
    expect(wrapper.find(".wl-stat-card__desc").text()).toBe("из дневной цели 6 часов");
  });

  it("renders the progress bar with clamped width and tone", () => {
    const wrapper = mount(WlStatCard, {
      global,
      props: { label: "Фокус дня", value: "Атлас", progress: 70, tone: "success" }
    });
    const bar = wrapper.find(".wl-stat-card__bar");
    expect(bar.attributes("role")).toBe("progressbar");
    expect(bar.attributes("aria-valuenow")).toBe("70");
    expect(wrapper.find(".wl-stat-card__bar-fill").attributes("style")).toContain("width: 70%");
    expect(wrapper.find('[data-wl="stat-card"]').attributes("data-tone")).toBe("success");

    const over = mount(WlStatCard, { global, props: { label: "x", value: "y", progress: 140 } });
    expect(over.find(".wl-stat-card__bar-fill").attributes("style")).toContain("width: 100%");
  });

  it("omits the bar without progress and supports slots", () => {
    const wrapper = mount(WlStatCard, {
      global,
      props: { label: "Без прогресса" },
      slots: { default: "<b class='v'>17</b>", footer: "<span class='f'>обновлено</span>" }
    });
    expect(wrapper.find(".wl-stat-card__bar").exists()).toBe(false);
    expect(wrapper.find(".wl-stat-card__value .v").text()).toBe("17");
    expect(wrapper.find(".wl-stat-card__footer .f").text()).toBe("обновлено");
  });
});

describe("id / aria forwarding to inner elements", () => {
  it("WlInput puts id and aria-* on the inner input, keeps class/style on the wrapper", () => {
    const wrapper = mount(WlInput, {
      global,
      attrs: { id: "f1", "aria-describedby": "f1-desc", class: "extra-class", style: "max-width: 200px" }
    });
    const input = wrapper.find("input");
    expect(input.attributes("id")).toBe("f1");
    expect(input.attributes("aria-describedby")).toBe("f1-desc");
    expect(input.classes()).not.toContain("extra-class");

    const root = wrapper.find('[data-wl="input"]');
    expect(root.attributes("id")).toBeUndefined();
    expect(root.classes()).toContain("extra-class");
    expect(root.attributes("style")).toContain("max-width: 200px");
  });

  it("WlTextarea lands id on the textarea itself", () => {
    const wrapper = mount(WlTextarea, {
      global,
      attrs: { id: "f2", "aria-describedby": "f2-desc" }
    });
    const textarea = wrapper.find("textarea");
    expect(textarea.attributes("id")).toBe("f2");
    expect(textarea.attributes("aria-describedby")).toBe("f2-desc");
  });

  it("WlPasswordInput forwards id to the inner input", () => {
    const wrapper = mount(WlPasswordInput, {
      global,
      attrs: { id: "f3" }
    });
    expect(wrapper.find("input").attributes("id")).toBe("f3");
    expect(wrapper.find('[data-wl="password-input"]').attributes("id")).toBeUndefined();
  });

  it("WlNumberInput forwards id and aria-label to the inner input", () => {
    const wrapper = mount(WlNumberInput, {
      global,
      attrs: { id: "f4", "aria-label": "Количество" }
    });
    const input = wrapper.find(".wl-stepper__input");
    expect(input.attributes("id")).toBe("f4");
    expect(input.attributes("aria-label")).toBe("Количество");
    expect(wrapper.find('[data-wl="number-input"]').attributes("id")).toBeUndefined();
  });
});
