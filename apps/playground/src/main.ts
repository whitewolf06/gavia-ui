import { createApp } from "vue";
import PrimeVue from "primevue/config";
import {
  createWlPt,
  wlLocaleRu,
  WlConfirmationService,
  WlToastService
} from "@whitelife-core/ui-kit";

// Стили подключаются явно: reset → base → темы
import "@whitelife-core/ui-kit/styles/reset.css";
import "@whitelife-core/ui-kit/styles/base.css";
import "@whitelife-core/ui-kit/themes/white.css";
import "@whitelife-core/ui-kit/themes/graphite.css";
import "@whitelife-core/ui-kit/themes/newspaper.css";

import App from "./App.vue";

const app = createApp(App);
app.use(PrimeVue, { unstyled: true, pt: createWlPt(), locale: wlLocaleRu });
app.use(WlToastService);
app.use(WlConfirmationService);
app.mount("#app");
