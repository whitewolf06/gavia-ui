export type WlManifestPropType = "string" | "number" | "boolean" | "enum" | "icon" | "object" | "array" | "union" | "slot-content";
export interface WlPropManifest {
    name: string;
    type: WlManifestPropType;
    required?: boolean;
    default?: unknown;
    /** Допустимые значения для enum/union/icon. */
    values?: readonly (string | number)[];
    description?: string;
}
export interface WlSlotManifest {
    name: string;
    description?: string;
}
export interface WlEmitManifest {
    name: string;
    payload?: string;
    description?: string;
}
export interface WlModelManifest {
    name: string;
    type: string;
    description?: string;
}
export type WlManifestCategory = "actions" | "inputs" | "data" | "containers" | "composites" | "navigation" | "feedback" | "misc";
export interface WlComponentManifest {
    /** Имя компонента, например "WlButton". */
    name: string;
    /** Первая публичная версия пакета, содержащая компонент. */
    introducedIn: string;
    category: WlManifestCategory;
    description?: string;
    props: WlPropManifest[];
    slots: WlSlotManifest[];
    emits: WlEmitManifest[];
    /** Основной v-model, если есть. */
    model?: WlModelManifest;
}
export type WlComponentManifestDefinition = Omit<WlComponentManifest, "introducedIn">;
/**
 * История первой публичной поставки компонентов. Новые компоненты нужно
 * добавлять сюда в том же изменении, что и в component manifest.
 */
export declare const WL_COMPONENT_INTRODUCED_IN: Readonly<Record<string, string>>;
export declare function defineComponentManifest(entries: WlComponentManifestDefinition[]): WlComponentManifest[];
