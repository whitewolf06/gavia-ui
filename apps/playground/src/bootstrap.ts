import { createWlPt, useWlConfig, WlConfig, WlConfirmationService, wlLocaleEn, wlLocaleRu, WlToastService } from "gavia-ui";
import { createApp, effectScope, watch } from "vue";
import App from "./App.vue";
import { playgroundI18n, playgroundLocale, preparePlaygroundPage } from "./i18n";
import { parsePlaygroundRoute } from "./navigation";
import { preloadPlaygroundPage } from "./page-loaders";
import { createPlaygroundRouter } from "./router";

async function mount(): Promise<void> {
  const router = createPlaygroundRouter(import.meta.env.BASE_URL);
  const view = parsePlaygroundRoute(window.location.search, window.location.hash, window.location.pathname).view;
  await Promise.all([preloadPlaygroundPage(view), preparePlaygroundPage(view)]);
  const app = createApp(App);
  app.use(playgroundI18n);
  if (router) {
    app.use(router);
    await router.isReady();
  }
  app.use(WlConfig, { pt: createWlPt(), locale: playgroundLocale.value === "ru" ? wlLocaleRu : wlLocaleEn });
  app.use(WlToastService);
  app.use(WlConfirmationService);
  const localeScope = effectScope();
  localeScope.run(() => {
    const configuration = app.runWithContext(useWlConfig);
    watch(playgroundLocale, (locale) => {
      configuration.setLocale(locale === "ru" ? wlLocaleRu : wlLocaleEn);
    });
  });
  // Vue 3.4 has no app.onUnmount; keep this application-owned watcher scoped.
  const unmount = app.unmount.bind(app);
  app.unmount = () => {
    localeScope.stop();
    unmount();
  };
  try {
    app.mount("#app");
    delete document.documentElement.dataset.wlBoot;
    document.documentElement.removeAttribute("data-playground-prerendered");
  } catch (error) {
    localeScope.stop();
    throw error;
  }
}
function start(): void {
  if (document.documentElement.hasAttribute("data-playground-prerendered")) delete document.documentElement.dataset.wlBoot;
  else document.documentElement.dataset.wlBoot = "loading";
  void mount().catch(() => {
    document.documentElement.dataset.wlBoot = "error";
    const notice = document.createElement("div");
    notice.className = "pg-startup-notice";
    notice.setAttribute("role", "alert");
    const message = document.createElement("p");
    message.textContent = playgroundLocale.value === "ru"
      ? "Не удалось загрузить содержимое. Попробуйте ещё раз."
      : "The requested content could not be loaded. Try again.";
    const retry = document.createElement("button");
    retry.type = "button";
    retry.textContent = playgroundLocale.value === "ru" ? "Повторить" : "Try again";
    retry.addEventListener("click", () => {
      notice.remove();
      start();
    }, { once: true });
    notice.append(message, retry);
    const target = document.querySelector("[data-playground-boot-error]");
    if (target) target.append(notice);
    else document.getElementById("app")?.prepend(notice);
  });
}
start();
