import type { Locator } from "@playwright/test";
import { expect, test } from "@playwright/test";

async function geometry(fixture: Locator): Promise<void> {
  const cases = await fixture.locator("[data-slider-case]").evaluateAll((elements) => elements.map((element) => {
    const root = element.querySelector<HTMLElement>('[data-wl="slider"]')!;
    const box = root.getBoundingClientRect();
    const range = root.classList.contains("wl-slider-range");
    const before = getComputedStyle(root, "::before");
    const trackY = range ? box.top + Number.parseFloat(before.top) + Number.parseFloat(before.height) / 2 : null;
    const thumb = Number.parseFloat(getComputedStyle(root).getPropertyValue("--wl-slider-thumb"));
    const inputs = root instanceof HTMLInputElement ? [root] : [...root.querySelectorAll("input")];
    const next = element.querySelector("[data-after-slider]")?.getBoundingClientRect();
    return {
      name: element.getAttribute("data-slider-case"), left: box.left, right: box.right, bottom: box.bottom,
      trackY, trackHeight: Number.parseFloat(before.height), nextTop: next?.top,
      inputY: inputs.map((input) => {
        const r = input.getBoundingClientRect();
        return r.top + r.height / 2;
      }),
      inputHeight: inputs[0]!.getBoundingClientRect().height,
      marks: [...root.querySelectorAll<HTMLElement>(".wl-slider__mark")].map((mark) => {
        const r = mark.getBoundingClientRect();
        const percent = Number.parseFloat(mark.style.left) / 100;
        return { text: mark.textContent, left: r.left, right: r.right, bottom: r.bottom,
          center: r.left + r.width / 2, percent, expectedCenter: box.left + thumb / 2 + percent * (box.width - thumb) };
      })
    };
  }));
  expect(cases).toHaveLength(5);
  for (const item of cases) {
    if (item.trackY !== null) {
      for (const center of item.inputY) expect(Math.abs(center - item.trackY), `${item.name}: thumb and track axis`).toBeLessThanOrEqual(0.5);
      expect(item.trackHeight, `${item.name}: shared track thickness`).toBeCloseTo(item.inputHeight, 1);
    }
    for (const mark of item.marks) {
      expect(mark.left, `${item.name}: ${mark.text} left bound`).toBeGreaterThanOrEqual(item.left - 0.5);
      expect(mark.right, `${item.name}: ${mark.text} right bound`).toBeLessThanOrEqual(item.right + 0.5);
      expect(mark.bottom, `${item.name}: ${mark.text} bottom bound`).toBeLessThanOrEqual(item.bottom + 0.5);
      if (mark.percent > 0 && mark.percent < 1) expect(mark.center).toBeCloseTo(mark.expectedCenter, 0);
    }
    if (item.nextTop !== undefined) expect(item.nextTop, `${item.name}: next control flow`).toBeGreaterThanOrEqual(item.bottom - 0.5);
  }
}

for (const theme of ["gavia", "gavia-dark", "white", "graphite", "newspaper"]) {
  test(`${theme}: slider thumbs, endpoint labels and following content share correct geometry @cross-browser`, async ({ page }, testInfo) => {
    await page.goto("/e2e.html?review-slider-geometry");
    await page.locator("html").evaluate((element, value) => {
      element.setAttribute("data-wl-theme", value);
    }, theme);
    const fixture = page.getByTestId("slider-geometry-fixture");
    const canvas = page.getByTestId("slider-geometry-canvas");
    for (const width of [240, 960]) {
      await canvas.evaluate((element, value) => {
        element.style.width = `${value}px`;
      }, width);
      for (const size of ["sm", "md"]) {
        await fixture.getByLabel("Slider size", { exact: true }).selectOption(size);
        await expect(fixture).toHaveAttribute("data-size", size);
        for (const density of ["default", "compact"]) {
          await fixture.getByLabel("Slider density", { exact: true }).selectOption(density);
          await expect(fixture).toHaveAttribute("data-density", density);
          await geometry(fixture);
        }
      }
    }
    await fixture.getByLabel("Fluid sliders", { exact: true }).uncheck();
    await geometry(fixture);
    await fixture.getByLabel("Fluid sliders", { exact: true }).check();
    await fixture.getByLabel("Custom slider tokens", { exact: true }).check();
    await geometry(fixture);
    await fixture.getByLabel("Invalid sliders", { exact: true }).check();
    await fixture.getByLabel("Disabled sliders", { exact: true }).check();
    for (const input of await canvas.getByRole("slider").all()) {
      await expect(input).toBeDisabled();
      await expect(input).toHaveAttribute("aria-invalid", "true");
    }
    await geometry(fixture);
    await fixture.getByLabel("Disabled sliders", { exact: true }).uncheck();
    await fixture.getByLabel("Invalid sliders", { exact: true }).uncheck();
    await fixture.getByLabel("Custom slider tokens", { exact: true }).uncheck();
    await fixture.getByLabel("Slider density", { exact: true }).selectOption("default");
    await canvas.screenshot({ path: testInfo.outputPath(`${theme}-slider-geometry.png`), animations: "disabled" });
  });
}

test("slider geometry preserves keyboard bounds, drag and model updates @cross-browser", async ({ page }) => {
  await page.goto("/e2e.html?review-slider-geometry");
  const fixture = page.getByTestId("slider-geometry-fixture");
  const range = fixture.locator('[data-slider-case="marked-range"]');
  const inputs = range.getByRole("slider");
  await inputs.first().press("ArrowRight");
  await expect(fixture.getByTestId("geometry-range-value")).toHaveText("31,90");
  await inputs.first().press("Home");
  await inputs.last().press("End");
  await expect(fixture.getByTestId("geometry-range-value")).toHaveText("10,110");
  const single = fixture.getByRole("slider", { name: "Bare single", exact: true });
  await single.press("Home");
  await expect(fixture.getByTestId("geometry-single-value")).toHaveText("10");
  await single.press("End");
  await expect(fixture.getByTestId("geometry-single-value")).toHaveText("110");
  await fixture.getByRole("button", { name: "Reset slider values", exact: true }).click();
  await inputs.first().scrollIntoViewIfNeeded();
  const position = await inputs.first().evaluate((input) => {
    const box = input.getBoundingClientRect();
    const thumb = Number.parseFloat(getComputedStyle(input).getPropertyValue("--wl-slider-thumb"));
    return { x: box.left + thumb / 2 + (box.width - thumb) * 0.2, y: box.top + box.height / 2,
      target: box.left + thumb / 2 + (box.width - thumb) * 0.45 };
  });
  await page.mouse.move(position.x, position.y);
  await page.mouse.down();
  await page.mouse.move(position.target, position.y, { steps: 8 });
  await page.mouse.up();
  const value = Number(await inputs.first().inputValue());
  expect(value).toBeGreaterThanOrEqual(54);
  expect(value).toBeLessThanOrEqual(56);
  await expect(fixture.getByTestId("geometry-range-value")).toHaveText(`${value},90`);
});
