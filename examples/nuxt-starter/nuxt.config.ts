export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  css: ["legato-ui/styles/reset.css", "legato-ui/styles/base.css", "legato-ui/themes/legato.css", "legato-ui/styles/fonts/legato.css"],
  app: { head: { htmlAttrs: { lang: "en", "data-wl-theme": "legato" } } }
});
