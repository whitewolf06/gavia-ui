import type { WlIconInput } from "./iconNames";

/** Fields interpreted by the menu renderer; consumer data stays opaque. */
export interface WlMenuItemBase {
  key?: string;
  label?: string;
  icon?: WlIconInput;
  shortcut?: string;
  danger?: boolean;
  disabled?: boolean;
  separator?: boolean;
  header?: string;
  href?: string;
  to?: unknown;
  target?: "_self" | "_blank" | "_parent" | "_top";
  /** Checked state is controlled by the application. Radio siblings are never mutated. */
  type?: "item" | "checkbox" | "radio";
  checked?: boolean | "mixed";
  group?: string;
  data?: unknown;
}

/** Keeps the released recursive command argument for the default generic. */
interface WlMenuLegacyItem extends WlMenuItemBase {
  command?: (item: WlMenuLegacyItem) => void;
  items?: readonly WlMenuLegacyItem[];
  onCheckedChange?: (checked: boolean, item: WlMenuLegacyItem) => void;
}

/** Use WlMenuItem<MyItem> to retain the full item in its command callback. */
export interface WlMenuItem<Item extends WlMenuItemBase = WlMenuLegacyItem> extends WlMenuItemBase {
  command?: (item: Item) => void;
  items?: readonly (Item & WlMenuItem<Item>)[];
  onCheckedChange?: (checked: boolean, item: Item) => void;
}

export interface WlMenuCheckEvent<Item extends WlMenuItemBase = WlMenuItem> {
  item: Item;
  checked: boolean;
}

export interface WlMenuExpose {
  toggle(event?: Event): void;
  show(event?: Event): void;
  hide(event?: Event): void;
}

export interface WlMenuTriggerSlotProps extends WlMenuExpose {
  attrs: Record<string, unknown>;
  visible: boolean;
}

export interface WlAccordionItem<Key extends string = string> {
  key: Key;
  title: string;
  content?: string;
  disabled?: boolean;
  icon?: WlIconInput;
}

export interface WlAccordionSlots<Item extends WlAccordionItem = WlAccordionItem> {
  /** Expanded item content with the original descriptor and open state. */
  item?(props: { item: Item; open: boolean }): unknown;
  /** Custom item heading with its current open state. */
  header?(props: { item: Item; open: boolean }): unknown;
  /** Custom disclosure icon with its current open state. */
  icon?(props: { item: Item; open: boolean }): unknown;
}

export interface WlSidebarItem<Data = unknown> {
  key: string;
  label: string;
  icon?: WlIconInput;
  badge?: number | string;
  href?: string;
  to?: unknown;
  disabled?: boolean;
  data?: Data;
}

export interface WlSidebarGroup<Item extends WlSidebarItem = WlSidebarItem> {
  id: string;
  label?: string;
  separator?: boolean;
  items: readonly Item[];
}

export interface WlSidebarExpose {
  openMobile(): void;
  closeMobile(): void;
  togglePinned(): void;
}

export interface WlCommandPaletteItem<Data = unknown> {
  id: string;
  label: string;
  description?: string;
  keywords?: readonly string[];
  icon?: WlIconInput;
  shortcut?: string;
  href?: string;
  to?: unknown;
  target?: "_self" | "_blank" | "_parent" | "_top";
  disabled?: boolean;
  data?: Data;
}

export interface WlCommandPaletteGroup<Item extends WlCommandPaletteItem = WlCommandPaletteItem> {
  id: string;
  label: string;
  items: readonly Item[];
  /** Show before a query has been entered. */
  showWhenEmpty?: boolean;
  /** false uses consumer-provided results without local filtering. */
  filter?: boolean;
}

export interface WlCommandPaletteExpose {
  focus(): void;
  open(): void;
  close(): void;
}
