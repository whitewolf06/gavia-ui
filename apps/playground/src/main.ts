// Стили подключаются явно: reset → base → темы
import "gavia-ui/styles/reset.css";
import "gavia-ui/styles/fonts/gavia.css";
import "gavia-ui/styles/base.css";
import "gavia-ui/styles/primitives.css";
import "gavia-ui/themes/white.css";
import "gavia-ui/themes/graphite.css";
import "gavia-ui/themes/newspaper.css";
// White also declares :root; explicit branded themes follow its fallback.
import "gavia-ui/themes/gavia.css";
import "gavia-ui/themes/gavia-dark.css";
import { parsePlaygroundLocale } from "./i18n/locale";
import { preloadPlaygroundCatalogs } from "./i18n/preload";
import { parsePlaygroundRoute } from "./navigation";
import { preloadPlaygroundPage } from "./page-loaders";
import { parsePlaygroundTheme } from "./themes";

// Resolve URL/saved/system preferences before the asynchronous application mounts.
document.documentElement.dataset.wlTheme = parsePlaygroundTheme(window.location.search);

// Fetch this route alongside startup, before locale preparation can delay it.
// Bootstrap awaits the same request and owns its retry notice if loading fails.
const initialView = parsePlaygroundRoute(window.location.search, window.location.hash, window.location.pathname).view;
const initialLocale = parsePlaygroundLocale(window.location.search, window.location.pathname);
void preloadPlaygroundCatalogs(initialView, initialLocale).catch(() => {});
void preloadPlaygroundPage(initialView).catch(() => {});
/** The component gallery is deliberately excluded from the initial entry. */
void import("./bootstrap");
