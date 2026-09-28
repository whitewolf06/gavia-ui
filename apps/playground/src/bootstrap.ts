import { createApp } from "vue";
import { WlConfig, WlConfirmationService, WlToastService, createWlPt, wlLocaleRu } from "../../../packages/ui-kit/src";
import App from "./App.vue";

const app = createApp(App);
app.use(WlConfig, { pt: createWlPt(), locale: wlLocaleRu });
app.use(WlToastService);
app.use(WlConfirmationService);
app.mount("#app");
