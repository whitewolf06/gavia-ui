import { expect, type Page, test } from "@playwright/test";
import { playgroundBasePath, playgroundRouteParams, russianPlaygroundUrl } from "./playground-url";
import { chooseShowcaseTheme } from "./select-helpers";

interface NativeTransitionEvidence {
  started: number;
  finished: number;
  keyboardDuringNative: number;
  ready: Array<{
    theme: string | undefined;
    marker: string | undefined;
    buttonDuration: string;
    imageDuration: string;
    symbolDuration: string;
    pointerTarget: boolean;
  }>;
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
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
});

test.afterEach(async ({ page }) => {
  expect(runtimeErrors.get(page), "Theme switches do not produce runtime errors").toEqual([]);
});

async function openHome(page: Page, baseURL: string | undefined, theme = "gavia"): Promise<URL> {
  const url = new URL(baseURL ?? "http://127.0.0.1:4173/");
  url.search = "?view=home&theme=" + theme + "&example=theme-switch";
  url.hash = "home-title";
  await page.goto(russianPlaygroundUrl(url.href), { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("home-page")).toBeVisible();
  const initialLayers = theme === "gavia-dark" || theme === "graphite" ? 2 : 1;
  await expect(page.locator(".home-hero-layer")).toHaveCount(initialLayers);
  await expect.poll(() => page.locator(".home-hero-layer").evaluateAll((elements) =>
    elements.length > 0 && elements.every((element) => {
      const image = element as HTMLImageElement;
      return image.complete && image.naturalWidth > 0;
    })
  ), { message: "Initial artwork is loaded; night artwork is deferred until the first dark theme" }).toBe(true);
  return url;
}
function heroToggle(page: Page) {
  return page.getByRole("button", { name: /^Включить (светлую|тёмную) тему$/ });
}
async function expectTheme(page: Page, theme: string, originalUrl: URL): Promise<void> {
  await expect(page.locator("html")).toHaveAttribute("data-wl-theme", theme);
  await expect.poll(() => {
    const current = new URL(page.url());
    return { theme: current.searchParams.get("theme"), example: current.searchParams.get("example"), view: playgroundRouteParams(current).get("view") ?? "home", path: playgroundBasePath(current), hash: current.hash };
  }).toEqual({ theme, example: "theme-switch", view: "home", path: originalUrl.pathname, hash: originalUrl.hash });
}
async function expectTransitionCleared(page: Page): Promise<void> {
  await expect.poll(() => page.locator("html").getAttribute("data-wl-playground-theme-transition")).toBeNull();
}
async function instrumentNativeTransitions(page: Page, holdUntilCancelled: number[] = []): Promise<void> {
  await page.addInitScript((heldTransitions: number[]) => {
    const target = window as typeof window & { themeNativeEvidence: NativeTransitionEvidence };
    target.themeNativeEvidence = { started: 0, finished: 0, keyboardDuringNative: 0, ready: [] };
    document.addEventListener("keydown", (event) => {
      if ((event.key === "Enter" || event.key === " ")
        && document.documentElement.dataset.wlPlaygroundThemeTransition === "native"
        && event.target instanceof HTMLButtonElement && event.target.classList.contains("home-theme-toggle")) {
        target.themeNativeEvidence.keyboardDuringNative += 1;
      }
    });
    const native = document.startViewTransition?.bind(document);
    if (!native) return;
    const holdStyle = document.createElement("style");
    holdStyle.textContent = `
      :root[data-wl-playground-theme-transition="native"]::view-transition-new(root) {
        animation-play-state: paused;
      }
    `;
    document.startViewTransition = ((update: () => Promise<void>) => {
      // Keep cancellation cases active across focus/input IPCs without replacing the native lifecycle.
      if (heldTransitions.includes(target.themeNativeEvidence.started + 1)) document.head.append(holdStyle);
      else holdStyle.remove();
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
      void transition.finished.then(() => {
        target.themeNativeEvidence.finished += 1;
      }, () => undefined);
      return transition;
    }) as typeof document.startViewTransition;
  }, holdUntilCancelled);
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

test("native theme snapshots suppress inner transitions and restore physical input after completion", { tag: "@cross-browser" }, async ({ page, baseURL }) => {
  // Isolate the initial hash's CSS smooth scroll, while keeping the real theme animation.
  await page.addInitScript(() => {
    const stopInitialScrollMotion = () => {
      if (document.documentElement) document.documentElement.style.scrollBehavior = "auto";
    };
    stopInitialScrollMotion();
    document.addEventListener("readystatechange", stopInitialScrollMotion, { once: true });
  });
  // Physical Enter cancels snapshot 1; the rapid-click chain cancels snapshot 3.
  await instrumentNativeTransitions(page, [1, 3]);
  const url = await openHome(page, baseURL);
  // This scenario requires the real native API; unsupported engines retain their configured skip.
  // eslint-disable-next-line playwright/no-skipped-test
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
      return {
        scrollY: window.scrollY,
        hitIsToggle: element.contains(hit),
        hitTag: hit?.tagName,
        hitClass: hit?.getAttribute("class"),
        bounds: { x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height },
        marker: document.documentElement.dataset.wlPlaygroundThemeTransition,
        theme: document.documentElement.dataset.wlTheme,
        focusedElementTag: document.activeElement?.tagName
      };
    }), { message: "The live hero icon is the actual pointer target below the sticky header" })
      .toMatchObject({ scrollY: 0, hitIsToggle: true });
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
  // WebKit scrolls the captured DOM during this programmatic focus setup even
  // with preventScroll. Restore the setup viewport before real keyboard input.
  await page.evaluate(() => window.scrollTo({ top: 0, left: 0, behavior: "instant" }));
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
  await page.evaluate(() => window.scrollTo({ top: 0, left: 0, behavior: "instant" }));
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

test("reduced motion updates theme, URL and focus without starting a native animation", { tag: "@cross-browser" }, async ({ page, baseURL }) => {
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

test("without View Transition API only the persistent hero artwork fades and the temporary marker is released", { tag: "@cross-browser" }, async ({ page, baseURL }) => {
  await page.addInitScript(() => {
    Object.defineProperty(document, "startViewTransition", { value: undefined, configurable: true });
  });
  const url = await openHome(page, baseURL);
  await page.evaluate(() => {
    const target = window as typeof window & { themeHeroFade: HeroFadeEvidence; themeHeroImages: Element[] };
    target.themeHeroImages = [...document.querySelectorAll(".home-hero-layer")];
    target.themeHeroFade = { events: [], intermediate: false };
    const observeNight = (night: Element) => {
      if (!target.themeHeroImages.includes(night)) target.themeHeroImages.push(night);
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
    };
    const night = document.querySelector(".home-hero-layer--night");
    if (night) observeNight(night);
    else {
      const observer = new MutationObserver(() => {
        const mounted = document.querySelector(".home-hero-layer--night");
        if (!mounted) return;
        observeNight(mounted);
        observer.disconnect();
      });
      observer.observe(document.querySelector(".home-hero")!, { childList: true });
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
  await expect(page.locator(".home-hero-layer")).toHaveCount(2);
  expect(await page.evaluate(() => {
    const original = (window as typeof window & { themeHeroImages: Element[] }).themeHeroImages;
    return [...document.querySelectorAll(".home-hero-layer")].every((image, index) => image === original[index]);
  }), "Changing theme preserves both loaded image nodes").toBe(true);
  await expect(toggle).toBeFocused();
  await toggle.press("Space");
  await expectTheme(page, "gavia", url);
  await expectTransitionCleared(page);
  await expect(page.locator(".home-hero-layer--night")).toHaveCSS("opacity", "0");
  await expect(page.locator(".home-hero-layer")).toHaveCount(2);
  expect(await page.evaluate(() => {
    const original = (window as typeof window & { themeHeroImages: Element[] }).themeHeroImages;
    return [...document.querySelectorAll(".home-hero-layer")].every((image, index) => image === original[index]);
  }), "Returning to light preserves both loaded artwork nodes").toBe(true);
  await expect(toggle).toBeFocused();
});
