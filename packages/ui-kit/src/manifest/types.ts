export type WlManifestPropType =
  | "string"
  | "number"
  | "boolean"
  | "enum"
  | "icon"
  | "object"
  | "array"
  | "union"
  | "slot-content";

export interface WlPropManifest {
  name: string;
  type: WlManifestPropType;
  required?: boolean;
  default?: unknown;
  /** Допустимые значения для enum/union/icon. */
  values?: readonly string[];
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

export type WlManifestCategory =
  | "actions"
  | "inputs"
  | "data"
  | "containers"
  | "navigation"
  | "feedback"
  | "misc";

export interface WlComponentManifest {
  /** Имя компонента, например "WlButton". */
  name: string;
  category: WlManifestCategory;
  description?: string;
  props: WlPropManifest[];
  slots: WlSlotManifest[];
  emits: WlEmitManifest[];
  /** Основной v-model, если есть. */
  model?: WlModelManifest;
}
