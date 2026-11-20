import { createApp, h } from "vue";
import { WlButton } from "legato-ui";
createApp({ render: () => h(WlButton, { variant: "primary" }, { default: () => "Button only" }) }).mount("#app");

