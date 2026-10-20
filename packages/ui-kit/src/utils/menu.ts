import type { WlMenuItem, WlMenuItemBase } from "../navigation-types";

export type MenuEntry<Item extends WlMenuItemBase> = Item & WlMenuItem<Item>;
export interface MenuPanelExpose {
  focusFirst(): void;
  focusLast(): void;
  focusActive(): void;
  closeChildren(restoreFocus?: boolean): boolean;
}
export type MenuDismissReason = "select" | "tab";
export function menuItemDisabled(item: WlMenuItemBase | undefined): boolean {
  return !item || !!item.disabled || !!item.separator || item.header !== undefined;
}
