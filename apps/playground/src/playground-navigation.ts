import type { InjectionKey, Ref } from "vue";
import type { WlThemeName } from "../../../packages/ui-kit/src/types";
import type { PlaygroundRoute } from "./navigation";

/** SPA navigation for page breadcrumbs; their real URLs remain usable in a new tab. */
export const playgroundNavigationKey: InjectionKey<{
  navigate: (route: PlaygroundRoute) => void | Promise<void>;
  theme: Readonly<Ref<WlThemeName>>;
}> = Symbol("playground-navigation");
