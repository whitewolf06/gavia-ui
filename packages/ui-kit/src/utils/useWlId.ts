import * as Vue from "vue";
import { getCurrentInstance, type ComponentInternalInstance } from "vue";

const renderIds = new WeakMap<ComponentInternalInstance, number>();

/** Vue 3.5 supplies SSR-safe IDs; 3.4 keeps the declared peer support. */
export function useWlId(): string {
  // Reflect prevents bundlers turning this into a missing Vue 3.4 named import.
  const nativeUseId = Reflect.get(Vue, "useId") as (() => string) | undefined;
  if (typeof nativeUseId === "function") return nativeUseId();

  const instance = getCurrentInstance();
  if (!instance) throw new Error("Gavia UI IDs must be generated during component setup");
  const context = instance.appContext;
  const index = renderIds.get(instance.root) ?? 0;
  renderIds.set(instance.root, index + 1);
  // A fresh root resets IDs for each SSR render, even when its app is reused.
  const config = context.config as typeof context.config & { idPrefix?: string };
  return `${config.idPrefix || "v"}-${index}`;
}
