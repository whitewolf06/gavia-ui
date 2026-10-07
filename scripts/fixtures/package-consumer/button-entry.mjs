import { createApp, h } from "vue";
import { WlButton } from "gavia-ui";
createApp({ render: () => h(WlButton, { variant: "primary" }, { default: () => "Button only" }) }).mount("#app");

