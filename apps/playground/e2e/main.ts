import { createApp } from "vue";
import {
  WlConfig, WlConfirmationService, WlToastService, WlTooltip, createWlPt, wlLocaleRu
} from "../../../packages/ui-kit/src";
import Fixture from "./Fixture.vue";
import "gavia-ui/styles/reset.css";
import "gavia-ui/styles/base.css";
import "gavia-ui/styles/fonts/gavia.css";
import "gavia-ui/themes/white.css";
import "gavia-ui/themes/graphite.css";
import "gavia-ui/themes/newspaper.css";
import "gavia-ui/themes/gavia.css";
import "gavia-ui/themes/gavia-dark.css";

const app = createApp(Fixture);
app.use(WlConfig, {
  pt: createWlPt(), locale: wlLocaleRu,
  motion: new URLSearchParams(window.location.search).get("motion") !== "off"
});
app.use(WlToastService);
app.use(WlConfirmationService);
app.directive("wl-tooltip", WlTooltip);
app.mount("#app");
