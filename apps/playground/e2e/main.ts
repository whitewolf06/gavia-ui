import { createApp } from "vue";
import {
  createWlPt, WlConfig, WlConfirmationService, wlLocaleRu, WlToastService, WlTooltipDirective
} from "../../../packages/ui-kit/src";
import Fixture from "./Fixture.vue";
import "legato-ui/styles/reset.css";
import "legato-ui/styles/base.css";
import "legato-ui/styles/fonts/legato.css";
import "legato-ui/themes/white.css";
import "legato-ui/themes/graphite.css";
import "legato-ui/themes/newspaper.css";
import "legato-ui/themes/gavia.css";
import "legato-ui/themes/gavia-dark.css";
import "legato-ui/themes/legato.css";
import "legato-ui/themes/legato-dark.css";

const app = createApp(Fixture);
app.use(WlConfig, {
  pt: createWlPt(), locale: wlLocaleRu,
  motion: new URLSearchParams(window.location.search).get("motion") !== "off"
});
app.use(WlToastService);
app.use(WlConfirmationService);
app.directive("wl-tooltip", WlTooltipDirective);
app.mount("#app");
