import { Ref } from 'vue';
import { wlBreakpoints } from "../design-system/tokens.generated.js";
/** Starts observing only after mount; SSR returns the explicit fallback. */
export declare function useWlMediaQuery(query: string, fallback?: boolean): Readonly<Ref<boolean>>;
export declare function useWlReducedMotion(): Readonly<Ref<boolean>>;
/** Uses the same minimum widths as the generated design-system catalog. */
export declare function useWlBreakpoint(): Record<keyof typeof wlBreakpoints, Readonly<Ref<boolean>>>;
