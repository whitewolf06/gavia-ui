import { createApp } from "vue";
import PrimeVue from "primevue/config";
import { createWlPt } from "../../../packages/ui-kit/src/theme";
import { wlLocaleRu } from "../../../packages/ui-kit/src/locale";
import WlConfirmationService from "primevue/confirmationservice";
import WlToastService from "primevue/toastservice";
import App from "./App.vue";

const app = createApp(App);
app.use(PrimeVue, { unstyled: true, pt: createWlPt(), locale: wlLocaleRu });
app.use(WlToastService);
app.use(WlConfirmationService);
app.mount("#app");
