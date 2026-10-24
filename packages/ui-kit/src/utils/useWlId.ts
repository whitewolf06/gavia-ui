import { type ComponentInternalInstance, getCurrentInstance } from "vue";
import { useWlIdPrefix } from "../config";

const renderIds = new WeakMap<ComponentInternalInstance, number>();

/** Root-scoped IDs use the same SSR and hydration path on Vue 3.4 and 3.5. */
export function useWlId(): string {
  const instance = getCurrentInstance();
  if (!instance) throw new Error("Gavia UI IDs must be generated during component setup");
  const context = instance.appContext;
  const index = renderIds.get(instance.root) ?? 0;
  renderIds.set(instance.root, index + 1);
  // A fresh root resets IDs for each SSR render, even when its app is reused.
  const config = context.config as typeof context.config & { idPrefix?: string };
  return `${config.idPrefix || useWlIdPrefix() || "v"}-${index}`;
}
