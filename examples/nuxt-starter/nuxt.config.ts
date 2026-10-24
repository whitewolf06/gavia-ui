export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  css: ["gavia-ui/styles/reset.css", "gavia-ui/styles/base.css", "gavia-ui/themes/gavia.css", "gavia-ui/styles/fonts/gavia.css"],
  app: { head: { htmlAttrs: { lang: "en", "data-wl-theme": "gavia" } } }
});
