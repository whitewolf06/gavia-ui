import { afterEach, expect, it } from "vitest";
import html from "../index.html?raw";
import { parsePlaygroundLocale } from "../src/i18n/locale";
import { createPlaygroundNavigationUrl } from "../src/navigation";
import { createPlaygroundRouter } from "../src/router";

afterEach(() => {
  window.history.replaceState(null, "", "/");
  localStorage.removeItem("gavia-ui.locale");
});

it("does not install history routing for a portable archive", () => {
  expect(createPlaygroundRouter("./")).toBeUndefined();
});

it("canonicalizes legacy links once and retains pinned English home visits", async () => {
  window.history.replaceState(null, "", "/gavia-ui/");
  const router = createPlaygroundRouter("/gavia-ui/")!;
  try {
    await router.push("/?view=docs&component=WlSelect&lang=ru&theme=white");
    expect(router.currentRoute.value.fullPath).toBe("/ru/docs/components/WlSelect/?theme=white");
    await router.push("/?lang=en");
    expect(router.currentRoute.value.fullPath).toBe("/?lang=en");
    localStorage.setItem("gavia-ui.locale", "ru");
    const visit = createPlaygroundNavigationUrl(new URL("https://example.test/gavia-ui/docs/?lang=en"), { view: "home" }, "/gavia-ui/");
    expect(parsePlaygroundLocale(visit.search, visit.pathname)).toBe("en");
  } finally { router.options.history.destroy(); }
});

it("resolves direct path language before bootstrap and before saved browser preferences", () => {
  const source = /<script>([\s\S]*?)<\/script>/.exec(html)![1]!;
  for (const [pathname, expected] of [["/gavia-ui/ru/docs/", "ru"], ["/gavia-ui/docs/", "en"]]) {
    const root = { dataset: {}, style: {}, lang: "" };
    new Function("location", "localStorage", "navigator", "document", "matchMedia", source)(
      { pathname, search: "" }, { getItem: () => expected === "ru" ? "en" : "ru" },
      { languages: [expected === "ru" ? "en-US" : "ru-RU"] }, { documentElement: root }, () => ({ matches: false })
    );
    expect(root.lang).toBe(expected);
  }
});
