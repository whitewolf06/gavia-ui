import { createApp, shallowReactive, watch } from "vue";
import { WlConfig, WlConfirmationService, WlToastService, createWlPt, wlLocaleEn, wlLocaleRu, type WlConfigOptions } from "../../../packages/ui-kit/src";
import { playgroundI18n, playgroundLocale } from "./i18n";
import App from "./App.vue";

const app = createApp(App);
const configuration = shallowReactive<WlConfigOptions>({ pt: createWlPt(), locale: playgroundLocale.value === "ru" ? wlLocaleRu : wlLocaleEn });
watch(playgroundLocale, (locale) => { configuration.locale = locale === "ru" ? wlLocaleRu : wlLocaleEn; });
app.use(playgroundI18n);
app.use(WlConfig, configuration);
app.use(WlToastService);
app.use(WlConfirmationService);
app.mount("#app");
