import { createRouter, createWebHistory, type Router } from "vue-router";
import { createPlaygroundNavigationUrl, parsePlaygroundRoute } from "./navigation";

/** Router stays in the documentation application, never in the library package. */
export function createPlaygroundRouter(base: string): Router | undefined {
  if (!base.startsWith("/")) return undefined;
  const router = createRouter({
    history: createWebHistory(base),
    // App owns asynchronous page preparation, retries, anchors and theme transitions.
    routes: [{ path: "/:pathMatch(.*)*", component: { render: () => null } }]
  });
  router.beforeEach((to) => {
    if (to.query.view === undefined && to.query.lang === undefined) return;
    const current = new URL(base.replace(/\/$/, "") + to.fullPath, window.location.origin);
    const target = createPlaygroundNavigationUrl(current, parsePlaygroundRoute(current.search, current.hash, current.pathname), base);
    target.hash = current.hash;
    if (target.href === current.href) return;
    return { path: target.pathname.slice(base.replace(/\/$/, "").length) || "/", query: Object.fromEntries(target.searchParams), hash: target.hash, replace: true };
  });
  return router;
}
