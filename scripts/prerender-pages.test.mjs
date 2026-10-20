import assert from "node:assert/strict";
import { resolve } from "node:path";
import { test } from "node:test";
import { prerenderTargets, serializePrerenderHtml } from "./prerender-pages.mjs";

test("plans separate English/Russian HTML inside the production output", () => {
  const root = resolve(".tmp/prerender-plan");
  assert.deepEqual(prerenderTargets(root, ["", "docs/", "ru/docs/components/WlButton/"]).map((entry) => entry.target),
    [resolve(root, "index.html"), resolve(root, "docs/index.html"), resolve(root, "ru/docs/components/WlButton/index.html")]);
});
test("rejects traversal, query and encoded filesystem paths before writing", () => {
  for (const path of ["../", "docs/../", "/docs/", "docs?lang=ru", "%2e%2e/", "C:/", "docs\\"]) {
    assert.throws(() => prerenderTargets(resolve(".tmp/prerender-plan"), [path]), /Unsafe/);
  }
});

test("serialized HTML rewrites only owned-origin DOM URLs and retains public/external/fragment attributes", () => {
  const origin = "http://127.0.0.1:4177";
  const attributes = [
    { href: origin + "/gavia-ui/ru/docs/theming/?theme=white#palette" },
    { src: "//127.0.0.1:4177/gavia-ui/assets/hero.webp" },
    { href: "https://whitewolf06.github.io/gavia-ui/ru/docs/theming/" },
    { action: "https://stackblitz.com/run?file=src%2FApp.vue" },
    { href: "#api" }, { src: "/gavia-ui/assets/icon.svg" }, { href: "mailto:hello@example.test" },
    { poster: origin + "/gavia-ui/assets/poster.png", formaction: origin + "/gavia-ui/action/" }
  ];
  let mounted = true;
  let portalRemoved = false;
  const clone = {
    querySelector: () => ({ removeAttribute: (name) => {
      assert.equal(name, "data-v-app");
      mounted = false;
    } }),
    querySelectorAll: (selector) => selector.startsWith("body")
      ? [{ remove: () => { portalRemoved = true; } }]
      : attributes.map((attrs) => ({
          getAttribute: (name) => attrs[name] ?? null,
          setAttribute: (name, value) => { attrs[name] = value; }
        })),
    get outerHTML() { return `<html><body><div id="app"${mounted ? ' data-v-app=""' : ""}>` + attributes.map((attrs) => JSON.stringify(attrs)).join("") + "</div></body></html>"; }
  };
  const html = serializePrerenderHtml({ origin, root: { cloneNode: (deep) => {
    assert.equal(deep, true);
    return clone;
  } } });
  assert.equal(attributes[0].href, "/gavia-ui/ru/docs/theming/?theme=white#palette");
  assert.equal(attributes[1].src, "/gavia-ui/assets/hero.webp");
  assert.equal(attributes[2].href, "https://whitewolf06.github.io/gavia-ui/ru/docs/theming/");
  assert.equal(attributes[3].action, "https://stackblitz.com/run?file=src%2FApp.vue");
  assert.equal(attributes[4].href, "#api");
  assert.equal(attributes[5].src, "/gavia-ui/assets/icon.svg");
  assert.equal(attributes[6].href, "mailto:hello@example.test");
  assert.equal(attributes[7].poster, "/gavia-ui/assets/poster.png");
  assert.equal(attributes[7].formaction, "/gavia-ui/action/");
  assert.equal(portalRemoved, true);
  assert.equal(html.startsWith("<!doctype html>\n"), true);
  assert.equal(html.includes(origin), false);
  assert.equal(html.includes("data-v-app"), false);
});
