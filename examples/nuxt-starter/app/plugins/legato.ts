import { WlConfig, wlLocaleEn } from "legato-ui";
export default defineNuxtPlugin((nuxtApp) => {
  // A fresh configuration belongs to each SSR request / client application.
  nuxtApp.vueApp.use(WlConfig, { locale: wlLocaleEn });
});
