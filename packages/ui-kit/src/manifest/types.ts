import apiMetadata from "./api.generated.json" with { type: "json" };

export type WlManifestPropType
  = | "string"
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

export type WlManifestCategory
  = | "actions"
    | "inputs"
    | "data"
    | "containers"
    | "composites"
    | "navigation"
    | "feedback"
    | "misc";

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
export const WL_COMPONENT_INTRODUCED_IN: Readonly<Record<string, string>> = {
  WlContextMenu: "1.0.0-rc.1",
  WlTooltip: "1.0.0-rc.1",
  WlTagsInput: "1.0.0-rc.1",
  WlToolbar: "1.0.0-rc.1",
  WlRadioGroup: "1.0.0-rc.1",
  WlCheckboxGroup: "1.0.0-rc.1",
  WlLink: "1.0.0-rc.1",
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
  WlFilePicker: "0.8.0",
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
  WlTimePicker: "0.8.0",
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
    const api = (apiMetadata as Record<string, {
      props: Record<string, string>;
      slots: Record<string, string>;
      emits: Record<string, string>;
      models: Record<string, string>;
      defaults: Record<string, unknown>;
      required: string[];
      descriptions: Record<string, string>;
      slotDescriptions: Record<string, string>;
      eventDescriptions: Record<string, string>;
    }>)[entry.name]
    ?? {
      props: {}, slots: {}, emits: {}, models: {}, defaults: {}, required: [],
      descriptions: {}, slotDescriptions: {}, eventDescriptions: {}
    };
    const props = entry.props.map((prop) => ({ ...prop, typescriptType: api?.props[prop.name] ?? prop.typescriptType }));
    for (const [name, typescriptType] of Object.entries(api?.props ?? {})) {
      if (name.endsWith("Modifiers") || props.some((prop) => prop.name === name)) continue;
      const type: WlManifestPropType = typescriptType === "boolean"
        ? "boolean"
        : typescriptType === "number" ? "number" : typescriptType === "string" ? "string" : "union";
      props.push({ name, type, typescriptType, ...(api.required.includes(name) ? { required: true } : {}),
        ...(Object.prototype.hasOwnProperty.call(api.defaults, name) ? { default: api.defaults[name] } : {}),
        ...(api.descriptions?.[name] ? { description: api.descriptions?.[name] } : {}) });
    }
    const slots = entry.slots.map((slot) => ({
      ...slot,
      typescriptType: api.slots[slot.name],
      description: slot.description ?? api.slotDescriptions?.[slot.name]
    }));
    for (const [name, signature] of Object.entries(api?.slots ?? {})) {
      if (!slots.some((slot) => slot.name === name)) slots.push({
        name, typescriptType: signature, description: api.slotDescriptions?.[name]
      });
    }
    const emits = entry.emits.map((event) => ({ ...event,
      typescriptType: api.emits[event.name] ?? (event.name.startsWith("update:") ? api.models[event.name.slice(7)] : undefined),
      description: event.description ?? api.eventDescriptions?.[event.name] }));
    for (const [name, payload] of Object.entries(api?.emits ?? {})) {
      if (!emits.some((event) => event.name === name)) emits.push({
        name, payload, typescriptType: payload, description: api.eventDescriptions?.[name]
      });
    }
    for (const [name, type] of Object.entries(api?.models ?? {})) {
      const event = `update:${name}`;
      if (!emits.some((item) => item.name === event)) emits.push({
        name: event, payload: type, typescriptType: type, description: undefined
      });
    }
    const firstModel = Object.entries(api?.models ?? {})[0];
    return { ...entry, introducedIn, props, slots, emits,
      ...(entry.model
        ? { model: { ...entry.model, typescriptType: api.models[entry.model.name] } }
        : firstModel ? { model: { name: firstModel[0], type: firstModel[1] } } : {}) };
  });
}
