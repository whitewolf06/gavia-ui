
// Стили подключаются явно: reset → base → темы
import "gavia-ui/styles/reset.css";
import "gavia-ui/styles/base.css";
import "gavia-ui/styles/primitives.css";
import "gavia-ui/themes/white.css";
import "gavia-ui/themes/graphite.css";
import "gavia-ui/themes/newspaper.css";
import gaviaMarkUrl from "../../../docs/brand/gavia-ui-mark-v2.png";

// Reuse the showcase mark before load so browsers do not request a missing favicon.ico.
const favicon = document.createElement("link");
favicon.rel = "icon";
favicon.type = "image/png";
favicon.href = gaviaMarkUrl;
document.head.append(favicon);

/** The component gallery is deliberately excluded from the initial entry. */
void import("./bootstrap");
