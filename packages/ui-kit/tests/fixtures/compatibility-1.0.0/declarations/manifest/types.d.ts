export type WlManifestPropType = "string" | "number" | "boolean" | "enum" | "icon" | "object" | "array" | "union" | "slot-content";
export interface WlPropManifest {
    name: string;
    type: WlManifestPropType;
    /** Source TypeScript annotation, generated through pnpm api:sync. */
    typescriptType?: string;
    required?: boolean;
    default?: unknown;
    /** Allowed values for enum, union or icon props. */
    values?: readonly (string | number)[];
    description?: string;
}
export interface WlSlotManifest {
    name: string;
    typescriptType?: string;
    description?: string;
}
export interface WlEmitManifest {
    name: string;
    typescriptType?: string;
    payload?: string;
    description?: string;
}
export interface WlModelManifest {
    name: string;
    type: string;
    typescriptType?: string;
    description?: string;
}
export type WlManifestCategory = "actions" | "inputs" | "data" | "containers" | "composites" | "navigation" | "feedback" | "misc";
export interface WlComponentManifest {
    /** Public component name, for example WlButton. */
    name: string;
    /** First public package version containing the component, including release candidates. */
    introducedIn: string;
    category: WlManifestCategory;
    description?: string;
    props: WlPropManifest[];
    slots: WlSlotManifest[];
    emits: WlEmitManifest[];
    /** Primary v-model, when present. Named models also appear in typed update events. */
    model?: WlModelManifest;
}
export type WlComponentManifestDefinition = Omit<WlComponentManifest, "introducedIn">;
/**
 * First-public-version registry. Add new components alongside their manifest
 * entry; source versioning and publication evidence remain separate.
 */
export declare const WL_COMPONENT_INTRODUCED_IN: Readonly<Record<string, string>>;
export declare function defineComponentManifest(entries: WlComponentManifestDefinition[]): WlComponentManifest[];
