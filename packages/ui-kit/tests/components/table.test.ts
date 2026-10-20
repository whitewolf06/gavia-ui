import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import type { WlTableColumn, WlTableRow } from "../../src";
import type { GlobalMountOptions } from "../mounting-types";
import { WlConfig } from "../../src";
import { createWlPt, WlTable } from "../../src";

// Wire the kit pt map like a real app, so DataTable sections get wl-* classes.
const global: GlobalMountOptions = {
  plugins: [[WlConfig, { pt: createWlPt() }]]
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
    const wrapper = mount(WlTable<WlTableRow>, { global, props: { value: rows, columns } });
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
    const wrapper = mount(WlTable<WlTableRow>, { global, props: { value: rows, columns } });
    const numericCells = wrapper.findAll(".wl-table__cell--num");
    // 1 header + 3 body cells
    expect(numericCells).toHaveLength(4);
    expect(numericCells[0]!.element.tagName).toBe("TH");
    expect(wrapper.findAll("td.wl-table__cell--num")).toHaveLength(3);
  });

  it("renders a scoped cell slot override with row and value", () => {
    const wrapper = mount(WlTable<WlTableRow>, {
      global,
      props: { value: rows, columns },
      slots: {
        "cell-status": "<template #cell-status=\"{ row, value }\"><span class=\"st\">{{ value }}@{{ row.project }}</span></template>"
      }
    });
    const custom = wrapper.findAll(".st");
    expect(custom).toHaveLength(3);
    expect(custom[0]!.text()).toBe("В работе@Атлас");
  });

  it("shows the empty message when there are no rows", () => {
    const wrapper = mount(WlTable<WlTableRow>, { global, props: { value: [], columns } });
    const empty = wrapper.find(".wl-table__empty-cell");
    expect(empty.exists()).toBe(true);
    expect(empty.text()).toBe("Нет данных");
  });

  it("honors a custom emptyMessage", () => {
    const wrapper = mount(WlTable<WlTableRow>, {
      global,
      props: { value: [], columns, emptyMessage: "Задач пока нет" }
    });
    expect(wrapper.find(".wl-table__empty-cell").text()).toBe("Задач пока нет");
  });

  it("shows the loading mask", () => {
    const wrapper = mount(WlTable<WlTableRow>, { global, props: { value: rows, columns, loading: true } });
    expect(wrapper.find(".wl-table__mask").exists()).toBe(true);
  });
});
