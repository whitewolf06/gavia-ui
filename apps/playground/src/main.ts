import { createApp } from "vue";
import PrimeVue from "primevue/config";
import { createWlPt, WlToastService } from "@whitelife/ui-kit";

// Стили подключаются явно: reset → base → темы
import "@whitelife/ui-kit/styles/reset.css";
import "@whitelife/ui-kit/styles/base.css";
import "@whitelife/ui-kit/themes/white.css";
import "@whitelife/ui-kit/themes/graphite.css";

import App from "./App.vue";

const app = createApp(App);
app.use(PrimeVue, { unstyled: true, pt: createWlPt() });
app.use(WlToastService);
app.mount("#app");
