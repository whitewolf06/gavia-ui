import { type App, getCurrentInstance, nextTick } from "vue";
import { onWlAppUnmount } from "../utils/appCleanup";

interface Announcer { polite: HTMLElement; assertive: HTMLElement; revision: number }
const announcers = new WeakMap<App, Announcer>();

/** Two live regions, created lazily per Vue application. Toast messages own their own roles. */
export function useWlAnnouncer(): { announce: (message: string, priority?: "polite" | "assertive") => Promise<void> } {
  const app = getCurrentInstance()?.appContext.app;
  function getRegions(): Announcer | undefined {
    if (!app || typeof document === "undefined")
      return;
    let regions = announcers.get(app);
    if (!regions) {
      const make = (priority: "polite" | "assertive"): HTMLElement => {
        const element = document.createElement("div");
        element.className = "wl-sr-only";
        element.setAttribute("data-wl-announcer", "");
        element.setAttribute("aria-live", priority);
        element.setAttribute("aria-atomic", "true");
        document.body.append(element);
        return element;
      };
      regions = { polite: make("polite"), assertive: make("assertive"), revision: 0 };
      announcers.set(app, regions);
      onWlAppUnmount(app, () => {
        const current = announcers.get(app);
        if (current) {
          current.revision++;

          current.polite.remove();

          current.assertive.remove();
        }
        announcers.delete(app);
      });
    }
    return regions;
  }
  return {
    async announce(message, priority = "polite") {
      const regions = getRegions();
      if (!regions)
        return;
      const revision = ++regions.revision;
      regions[priority].textContent = "";
      await nextTick();
      if (regions.revision === revision && regions[priority].isConnected)
        regions[priority].textContent = message;
    }
  };
}
