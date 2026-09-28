import { createApp } from "vue";
import {
  WlConfig, WlConfirmationService, WlToastService, WlTooltip, createWlPt, wlLocaleRu
} from "../../../packages/ui-kit/src";
import Fixture from "./Fixture.vue";
import "@whitelife-core/ui-kit/styles/reset.css";
import "@whitelife-core/ui-kit/styles/base.css";
import "@whitelife-core/ui-kit/themes/white.css";
import "@whitelife-core/ui-kit/themes/graphite.css";
import "@whitelife-core/ui-kit/themes/newspaper.css";

const app = createApp(Fixture);
app.use(WlConfig, { pt: createWlPt(), locale: wlLocaleRu });
app.use(WlToastService);
app.use(WlConfirmationService);
app.directive("wl-tooltip", WlTooltip);
app.mount("#app");
