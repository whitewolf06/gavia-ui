import { nextTick } from "vue";
import { createPackedSSRApp } from "./packed-fixture.mjs";
import "legato-ui/styles/reset.css";
import "legato-ui/styles/base.css";
import "legato-ui/styles/primitives.css";
import "legato-ui/styles/fonts/gavia.css";
import "legato-ui/themes/white.css";
import "legato-ui/themes/graphite.css";
import "legato-ui/themes/newspaper.css";
import "legato-ui/themes/gavia.css";

// Retain references before hydration to detect replacement of server DOM.
window.__packedSSRBefore = {
  ids: [...document.querySelectorAll("#ssr-app [id]")].map((node) => node.id),
  input: document.querySelector("#ssr-app input"),
  root: document.querySelector("#packed-fixture")
};
createPackedSSRApp().mount("#ssr-app");
nextTick().then(() => { document.documentElement.dataset.hydrated = "true"; });

