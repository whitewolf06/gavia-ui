import type { WlThemeName } from "gavia-ui";
import type { InjectionKey, Ref } from "vue";
import type { PlaygroundRoute } from "./navigation";
import type { PlaygroundThemePreference } from "./themes";

/** SPA navigation for page breadcrumbs; their real URLs remain usable in a new tab. */
export const playgroundNavigationKey: InjectionKey<{
  navigate: (route: PlaygroundRoute) => void | Promise<void>;
  theme: Readonly<Ref<WlThemeName>>;
  themePreference: Readonly<Ref<PlaygroundThemePreference>>;
}> = Symbol("playground-navigation");
