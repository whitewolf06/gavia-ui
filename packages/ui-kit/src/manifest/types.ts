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

export type WlManifestCategory =
  | "actions"
  | "inputs"
  | "data"
  | "containers"
  | "composites"
  | "navigation"
  | "feedback"
  | "misc";

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
export const WL_COMPONENT_INTRODUCED_IN: Readonly<Record<string, string>> = {
  WlAccordion: "0.1.0",
  WlAlert: "0.1.0",
  WlAutocomplete: "0.2.0",
  WlAvatar: "0.1.0",
  WlBadge: "0.1.0",
  WlBreadcrumbs: "0.1.0",
  WlButton: "0.1.0",
  WlButtonGroup: "0.1.0",
  WlCalendar: "0.1.0",
  WlCard: "0.1.0",
  WlCheckbox: "0.1.0",
  WlChip: "0.1.0",
  WlColorPicker: "0.1.0",
  WlCommandPalette: "0.2.0",
  WlConfirmDialog: "0.2.0",
  WlDatePicker: "0.1.0",
  WlDialog: "0.1.0",
  WlDivider: "0.1.0",
  WlDrawer: "0.1.0",
  WlEmpty: "0.1.0",
  WlField: "0.1.0",
  WlFileUpload: "0.1.0",
  WlFilterBar: "0.3.0",
  WlIcon: "0.1.0",
  WlIconButton: "0.1.0",
  WlInput: "0.1.0",
  WlMenu: "0.1.0",
  WlMultiSelect: "0.2.0",
  WlNavItem: "0.1.0",
  WlNumberInput: "0.1.0",
  WlPagination: "0.1.0",
  WlPageHeader: "0.3.0",
  WlPasswordInput: "0.1.0",
  WlPill: "0.1.0",
  WlPopover: "0.1.0",
  WlProgress: "0.1.0",
  WlRadio: "0.1.0",
  WlSegmented: "0.1.0",
  WlSelect: "0.1.0",
  WlSidebar: "0.2.0",
  WlSkeleton: "0.1.0",
  WlSlider: "0.1.0",
  WlSpinner: "0.1.0",
  WlStatCard: "0.1.0",
  WlSteps: "0.1.0",
  WlSwitch: "0.1.0",
  WlTable: "0.1.0",
  WlTabs: "0.1.0",
  WlTag: "0.1.0",
  WlTextarea: "0.1.0",
  WlToast: "0.1.0"
};

export function defineComponentManifest(
  entries: WlComponentManifestDefinition[]
): WlComponentManifest[] {
  return entries.map((entry) => {
    const introducedIn = WL_COMPONENT_INTRODUCED_IN[entry.name];
    if (!introducedIn) {
      throw new Error(`Missing introducedIn version for ${entry.name}`);
    }
    return { ...entry, introducedIn };
  });
}
