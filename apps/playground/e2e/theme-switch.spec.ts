import { expect, test, type Page } from "@playwright/test";
import { chooseShowcaseTheme } from "./select-helpers";

interface NativeTransitionEvidence {
  started: number;
  finished: number;
  keyboardDuringNative: number;
  ready: Array<{ theme: string | undefined; marker: string | undefined; buttonDuration: string; imageDuration: string; symbolDuration: string; pointerTarget: boolean }>;
}
interface HeroFadeEvidence {
  events: string[];
  intermediate: boolean;
}

const runtimeErrors = new WeakMap<Page, string[]>();
test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const errors: string[] = [];
  runtimeErrors.set(page, errors);
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
});
test.afterEach(async ({ page }) => {
  expect(runtimeErrors.get(page), "Theme switches do not produce runtime errors").toEqual([]);
});

async function openHome(page: Page, baseURL: string | undefined, theme = "gavia"): Promise<URL> {
  const url = new URL(baseURL ?? "http://127.0.0.1:4173/");
  url.search = "?view=home&theme=" + theme + "&example=theme-switch";
  url.hash = "home-title";
  await page.goto(url.href, { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("home-page")).toBeVisible();
  await expect.poll(() => page.locator(".home-hero-layer").evaluateAll((elements) =>
    elements.length === 2 && elements.every((element) => {
      const image = element as HTMLImageElement;
      return image.complete && image.naturalWidth > 0;
    })
  ), { message: "Both persistent hero images are loaded before the interaction" }).toBe(true);
  return url;
}
function heroToggle(page: Page) {
  return page.getByRole("button", { name: /^Включить (светлую|тёмную) тему$/ });
}
async function expectTheme(page: Page, theme: string, originalUrl: URL): Promise<void> {
  await expect(page.locator("html")).toHaveAttribute("data-wl-theme", theme);
  await expect.poll(() => {
    const current = new URL(page.url());
    return { theme: current.searchParams.get("theme"), example: current.searchParams.get("example"), view: current.searchParams.get("view"), path: current.pathname, hash: current.hash };
  }).toEqual({ theme, example: "theme-switch", view: "home", path: originalUrl.pathname, hash: originalUrl.hash });
}
async function expectTransitionCleared(page: Page): Promise<void> {
  await expect.poll(() => page.locator("html").getAttribute("data-wl-playground-theme-transition")).toBeNull();
}
async function instrumentNativeTransitions(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const target = window as typeof window & { themeNativeEvidence: NativeTransitionEvidence };
    target.themeNativeEvidence = { started: 0, finished: 0, keyboardDuringNative: 0, ready: [] };
    document.addEventListener("keydown", (event) => {
      if ((event.key === "Enter" || event.key === " ") &&
        document.documentElement.dataset.wlPlaygroundThemeTransition === "native" &&
        event.target instanceof HTMLButtonElement && event.target.classList.contains("home-theme-toggle")) {
        target.themeNativeEvidence.keyboardDuringNative += 1;
      }
    });
    const native = document.startViewTransition?.bind(document);
    if (!native) return;
    document.startViewTransition = ((update: () => Promise<void>) => {
      const transition = native(update);
      target.themeNativeEvidence.started += 1;
      void transition.ready.then(() => {
        const duration = (selector: string) => {
          const element = document.querySelector(selector);
          return element ? getComputedStyle(element).transitionDuration : "missing";
        };
        const button = document.querySelector(".home-theme-toggle")!;
        const bounds = button.getBoundingClientRect();
        const hit = document.elementFromPoint(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
        target.themeNativeEvidence.ready.push({
          theme: document.documentElement.dataset.wlTheme,
          marker: document.documentElement.dataset.wlPlaygroundThemeTransition,
          buttonDuration: duration(".home-action"),
          imageDuration: duration(".home-hero-layer--night"),
          symbolDuration: duration(".home-theme-moon"),
          pointerTarget: button.contains(hit)
        });
      }, () => undefined);
      void transition.finished.then(() => { target.themeNativeEvidence.finished += 1; }, () => undefined);
      return transition;
    }) as typeof document.startViewTransition;
  });
}
async function nativeEvidence(page: Page): Promise<NativeTransitionEvidence> {
  return page.evaluate(() => (window as typeof window & { themeNativeEvidence: NativeTransitionEvidence }).themeNativeEvidence);
}

test("hero switch is a 32px themed ghost icon and keeps real theme pairs and header selection in sync", async ({ page, baseURL }) => {
  const url = await openHome(page, baseURL);
  const toggle = heroToggle(page);
  await expect(toggle).toHaveAttribute("type", "button");
  await expect(toggle).toHaveAttribute("data-wl", "icon-button");
  await expect(toggle).toHaveAttribute("data-variant", "ghost");
  await expect(toggle).toHaveAttribute("aria-label", "Включить тёмную тему");
  await expect(toggle).toHaveAttribute("title", "Включить тёмную тему");
  await expect(toggle.locator("svg")).toHaveCSS("width", "32px");
  await expect(toggle.locator("svg")).toHaveCSS("height", "32px");
  await expect(toggle.locator("svg")).toHaveAttribute("aria-hidden", "true");
  const box = await toggle.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.width).toBeGreaterThanOrEqual(44);
  expect(box!.height).toBeGreaterThanOrEqual(44);
  await expect(toggle).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  await expect(toggle).toHaveCSS("border-top-color", "rgba(0, 0, 0, 0)");
  await toggle.hover();
  await expect(toggle).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  await page.mouse.move(0, 0);

  await toggle.focus();
  await toggle.press("Enter");
  await expectTheme(page, "gavia-dark", url);
  await expectTransitionCleared(page);
  await expect(toggle).toBeFocused();
  await page.mouse.move(0, 0);
  await expect.poll(() => toggle.evaluate((element) => {
    const probe = document.createElement("span");
    probe.style.color = "var(--wl-accent)";
    element.append(probe);
    const matches = getComputedStyle(element).color === getComputedStyle(probe).color;
    probe.remove();
    return matches;
  }), { message: "The unhovered dark icon uses the selected theme accent" }).toBe(true);
  await expect(page.getByTestId("pg-theme-selector")).toContainText("Gavia Dark");
  await expect(page.locator(".home-hero-layer--night")).toHaveCSS("opacity", "1");
  await toggle.press("Space");
  await expectTheme(page, "gavia", url);
  await expectTransitionCleared(page);
  await expect(page.getByTestId("pg-theme-selector")).toContainText("Gavia");

  await chooseShowcaseTheme(page, "Classic");
  await expectTransitionCleared(page);
  await toggle.focus();
  await toggle.press("Enter");
  await expectTheme(page, "graphite", url);
  await expectTransitionCleared(page);
  await expect(page.getByTestId("pg-theme-selector")).toContainText("Classic Dark");
  await toggle.press("Enter");
  await expectTheme(page, "white", url);
  await expectTransitionCleared(page);

  await chooseShowcaseTheme(page, "Newspaper");
  await expectTransitionCleared(page);
  await toggle.focus();
  await toggle.press("Enter");
  await expectTheme(page, "graphite", url);
  await expectTransitionCleared(page);
  await toggle.press("Enter");
  await expectTheme(page, "newspaper", url);
  await expectTransitionCleared(page);
  // An explicit header selection replaces the remembered Newspaper light variant.
  await chooseShowcaseTheme(page, "Classic");
  await expectTransitionCleared(page);
  await toggle.focus();
  await toggle.press("Enter");
  await expectTheme(page, "graphite", url);
  await expectTransitionCleared(page);
  await toggle.press("Enter");
  await expectTheme(page, "white", url);
  await expectTransitionCleared(page);
  await expect(toggle).toBeFocused();
});

test("native theme snapshots suppress inner transitions and restore physical input after completion", async ({ page, baseURL }) => {
  // Isolate the initial hash's CSS smooth scroll, while keeping the real theme animation.
  await page.addInitScript(() => {
    const stopInitialScrollMotion = () => {
      if (document.documentElement) document.documentElement.style.scrollBehavior = "auto";
    };
    stopInitialScrollMotion();
    document.addEventListener("readystatechange", stopInitialScrollMotion, { once: true });
  });
  await instrumentNativeTransitions(page);
  const url = await openHome(page, baseURL);
  test.skip(!await page.evaluate(() => typeof document.startViewTransition === "function"), "This browser uses the separately tested CSS fallback");
  await page.evaluate(() => document.fonts.ready);
  const toggle = heroToggle(page);
  await toggle.focus();
  // Complete the mounted page's initial anchor callback before restoring the viewport.
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
  await page.evaluate(() => window.scrollTo({ top: 0, left: 0, behavior: "instant" }));
  const expectLivePointerTarget = async () => {
    await expect.poll(() => toggle.evaluate((element) => {
      const bounds = element.getBoundingClientRect();
      const hit = document.elementFromPoint(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
      return window.scrollY === 0 && element.contains(hit);
    }), { message: "The live hero icon is the actual pointer target below the sticky header" }).toBe(true);
  };
  await expectLivePointerTarget();
  let box = await toggle.boundingBox();
  expect(box).not.toBeNull();
  await page.mouse.click(box!.x + box!.width / 2, box!.y + box!.height / 2);
  await expect.poll(async () => (await nativeEvidence(page)).ready.length).toBe(1);
  const capture = (await nativeEvidence(page)).ready[0]!;
  expect({ theme: capture.theme, marker: capture.marker, buttonDuration: capture.buttonDuration,
    imageDuration: capture.imageDuration, symbolDuration: capture.symbolDuration })
    .toEqual({ theme: "gavia-dark", marker: "native", buttonDuration: "0s", imageDuration: "0s", symbolDuration: "0s" });
  // W3C §4.2 excludes captured subtrees from hit-testing during animation.
  // The ready microtask hit differs by engine; physical input is asserted after finished.
  // Safari's pointer policy may leave BODY focused; establish the keyboard case explicitly.
  await toggle.evaluate((element) => (element as HTMLButtonElement).focus({ preventScroll: true }));
  await expect(toggle).toBeFocused();
  await expect(page.locator("html")).toHaveAttribute("data-wl-playground-theme-transition", "native");
  await page.keyboard.press("Enter");
  await expectTheme(page, "gavia", url);
  await expectTransitionCleared(page);
  await expect.poll(async () => {
    const evidence = await nativeEvidence(page);
    return evidence.started === 2 && evidence.finished === evidence.started && evidence.keyboardDuringNative === 1;
  }).toBe(true);
  await expect(toggle).toBeFocused();
  await expectLivePointerTarget();
  box = await toggle.boundingBox();
  expect(box).not.toBeNull();
  await page.mouse.click(box!.x + box!.width / 2, box!.y + box!.height / 2);
  await expect.poll(async () => (await nativeEvidence(page)).ready.length).toBe(3);
  // Same-task button activation exercises three newer intents during an active snapshot.
  await toggle.evaluate((element) => (element as HTMLButtonElement).focus({ preventScroll: true }));
  await expect(toggle).toBeFocused();
  const markerAtActivation = await toggle.evaluate((element) => {
    const marker = document.documentElement.dataset.wlPlaygroundThemeTransition;
    const button = element as HTMLButtonElement;
    button.click();
    button.click();
    button.click();
    return marker;
  });
  expect(markerAtActivation).toBe("native");
  await expectTheme(page, "gavia", url);
  await expectTransitionCleared(page);
  await expect.poll(async () => {
    const evidence = await nativeEvidence(page);
    return evidence.started === 6 && evidence.finished === evidence.started;
  }).toBe(true);
  await expect(page.getByTestId("pg-theme-selector")).toContainText("Gavia");
  await expect(toggle).toBeFocused();
  await expectLivePointerTarget();
  await expect.poll(() => page.locator(".home-action").first().evaluate((element) =>
    getComputedStyle(element).transitionDuration.split(",").some((duration) => Number.parseFloat(duration) > 0)
  ), { message: "Normal component interactions regain their own transitions" }).toBe(true);
});
test("reduced motion updates theme, URL and focus without starting a native animation", async ({ page, baseURL }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await instrumentNativeTransitions(page);
  const url = await openHome(page, baseURL);
  const toggle = heroToggle(page);
  await toggle.focus();
  await toggle.press("Enter");
  await expectTheme(page, "gavia-dark", url);
  await expectTransitionCleared(page);
  expect((await nativeEvidence(page)).started).toBe(0);
  await expect(page.locator(".home-hero-layer--night")).toHaveCSS("opacity", "1");
  await expect(page.locator(".home-hero-layer--night")).toHaveCSS("transition-duration", "0s");
  await expect(page.locator(".home-theme-moon")).toHaveCSS("transition-duration", "0s");
  await expect(toggle).toBeFocused();
  await toggle.press("Space");
  await expectTheme(page, "gavia", url);
  await expectTransitionCleared(page);
  await expect(toggle).toBeFocused();
});

test("without View Transition API only the persistent hero artwork fades and the temporary marker is released", async ({ page, baseURL }) => {
  await page.addInitScript(() => {
    Object.defineProperty(document, "startViewTransition", { value: undefined, configurable: true });
  });
  const url = await openHome(page, baseURL);
  await page.evaluate(() => {
    const target = window as typeof window & { themeHeroFade: HeroFadeEvidence; themeHeroImages: Element[] };
    const night = document.querySelector(".home-hero-layer--night")!;
    target.themeHeroImages = [...document.querySelectorAll(".home-hero-layer")];
    target.themeHeroFade = { events: [], intermediate: false };
    let sampling = false;
    let stopAt = 0;
    const sample = () => {
      const opacity = Number.parseFloat(getComputedStyle(night).opacity);
      if (opacity > 0 && opacity < 1) target.themeHeroFade.intermediate = true;
      if (sampling && performance.now() < stopAt) requestAnimationFrame(sample);
    };
    for (const name of ["transitionrun", "transitionend", "transitioncancel"]) {
      night.addEventListener(name, (event) => {
        if ((event as TransitionEvent).propertyName !== "opacity") return;
        target.themeHeroFade.events.push(event.type);
        sampling = event.type === "transitionrun";
        if (sampling) {
          stopAt = performance.now() + 2000;
          requestAnimationFrame(sample);
        }
      });
    }
  });
  const toggle = heroToggle(page);
  await toggle.focus();
  await toggle.press("Enter");
  await expectTheme(page, "gavia-dark", url);
  await expectTransitionCleared(page);
  await expect.poll(() => page.evaluate(() =>
    (window as typeof window & { themeHeroFade: HeroFadeEvidence }).themeHeroFade.events
  )).toEqual(["transitionrun", "transitionend"]);
  const fade = await page.evaluate(() => (window as typeof window & { themeHeroFade: HeroFadeEvidence }).themeHeroFade);
  expect(fade.intermediate, "Real animation frames include intermediate image opacity").toBe(true);
  await expect(page.locator(".home-hero-layer--night")).toHaveCSS("opacity", "1");
  expect(await page.evaluate(() => {
    const original = (window as typeof window & { themeHeroImages: Element[] }).themeHeroImages;
    return [...document.querySelectorAll(".home-hero-layer")].every((image, index) => image === original[index]);
  }), "Changing theme preserves both loaded image nodes").toBe(true);
  await expect(toggle).toBeFocused();
  await toggle.press("Space");
  await expectTheme(page, "gavia", url);
  await expectTransitionCleared(page);
  await expect(page.locator(".home-hero-layer--night")).toHaveCSS("opacity", "0");
  await expect(toggle).toBeFocused();
});
