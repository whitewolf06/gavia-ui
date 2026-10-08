
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
import { parsePlaygroundTheme } from "./themes";

// Apply explicit URL themes before the asynchronous application mounts.
document.documentElement.dataset.wlTheme = parsePlaygroundTheme(window.location.search);

/** The component gallery is deliberately excluded from the initial entry. */
void import("./bootstrap");
