/** Consumer bundlers replace this literal; no Node type dependency is required. */
declare const process: { env: { NODE_ENV?: string } };
import { computed, type ComputedRef, getCurrentInstance, watchEffect } from "vue";
import type { WlTone } from "../types";
import { isWlDevelopment } from "./development";

/** Keep released variants as aliases while new consumers use the semantic tone axis. */
export function useWlTone(options: {
  component: string;
  tone: () => WlTone | undefined;
  variant: () => string;
  aliases: Readonly<Record<string, WlTone>>;
  fallback: WlTone | (() => WlTone);
  deprecated?: readonly string[];
}): ComputedRef<WlTone> {
  if (isWlDevelopment() && process.env.NODE_ENV !== "production") {
    const instance = getCurrentInstance();
    const warned = new Set<string>();
    watchEffect(() => {
      const value = options.variant();
      if (instance?.vnode.props?.variant === undefined || warned.has(value)
        || !(options.deprecated ?? Object.keys(options.aliases)).includes(value)) return;
      warned.add(value);
      console.warn(`[Gavia UI] ${options.component}: variant="${value}" is deprecated; use tone="${options.aliases[value]}" instead.`);
    });
  }
  return computed(() => options.tone() ?? options.aliases[options.variant()]
    ?? (typeof options.fallback === "function" ? options.fallback() : options.fallback));
}
