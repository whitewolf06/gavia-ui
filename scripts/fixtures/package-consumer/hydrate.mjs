import { nextTick } from "vue";
import { createPackedSSRApp } from "./packed-fixture.mjs";
import "gavia-ui/styles/reset.css";
import "gavia-ui/styles/base.css";
import "gavia-ui/styles/primitives.css";
import "gavia-ui/styles/fonts/gavia.css";
import "gavia-ui/themes/white.css";
import "gavia-ui/themes/graphite.css";
import "gavia-ui/themes/newspaper.css";
import "gavia-ui/themes/gavia.css";

// Retain references before hydration to detect replacement of server DOM.
window.__packedSSRBefore = {
  ids: [...document.querySelectorAll("#ssr-app [id]")].map((node) => node.id),
  input: document.querySelector("#ssr-app input"),
  root: document.querySelector("#packed-fixture")
};
createPackedSSRApp().mount("#ssr-app");
nextTick().then(() => { document.documentElement.dataset.hydrated = "true"; });

