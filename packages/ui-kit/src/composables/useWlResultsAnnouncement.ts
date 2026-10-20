import { onBeforeUnmount, watch } from "vue";
import { useWlLocale } from "../config";
import { formatWlLocaleText } from "../locale";
import { wlPlural } from "../utils/format";
import { useWlAnnouncer } from "./useWlAnnouncer";

/** Wait for a query to settle, and cancel stale announcements when a list closes. */
export function useWlResultsAnnouncement(options: {
  query: () => string;
  count: () => number;
  visible: () => boolean;
  loading?: () => boolean;
}): void {
  const locale = useWlLocale();
  const { announce } = useWlAnnouncer();
  let timer: ReturnType<typeof setTimeout> | undefined;
  watch([options.query, options.count, options.visible, () => options.loading?.() ?? false], () => {
    clearTimeout(timer);
    if (!options.visible() || options.loading?.()) return;
    timer = setTimeout(() => {
      const count = options.count();
      const text = locale.value.resultsFound;
      void announce(count === 0
        ? locale.value.noResults
        : typeof text === "string"
          ? formatWlLocaleText(text, { count })
          : wlPlural(locale.value.localeCode, count, text));
    }, 500);
  });
  onBeforeUnmount(() => clearTimeout(timer));
}
