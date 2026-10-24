import type { App } from "vue";

const cleanups = new WeakMap<App, Set<() => void>>();

/** App cleanup compatible with Vue 3.4, without global mixins or DOM on import. */
export function onWlAppUnmount(app: App, cleanup: () => void): void {
  let callbacks = cleanups.get(app);
  if (!callbacks) {
    callbacks = new Set();
    cleanups.set(app, callbacks);
    const unmount = app.unmount.bind(app);
    app.unmount = () => {
      const pending = cleanups.get(app);
      cleanups.delete(app);
      try {
        pending?.forEach((callback) => callback());
      } finally {
        unmount();
      }
    };
  }
  callbacks.add(cleanup);
}
