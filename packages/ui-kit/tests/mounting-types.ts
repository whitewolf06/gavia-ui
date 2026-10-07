import type { MountingOptions } from "@vue/test-utils";

/** Public VTU type shared by both the Vue 3.4-compatible and newer VTU releases. */
export type GlobalMountOptions = NonNullable<MountingOptions<{}>["global"]>;
