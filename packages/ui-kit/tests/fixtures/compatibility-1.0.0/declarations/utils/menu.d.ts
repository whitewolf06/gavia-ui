import { WlMenuItem, WlMenuItemBase } from "../navigation-types.js";
export type MenuEntry<Item extends WlMenuItemBase> = Item & WlMenuItem<Item>;
export interface MenuPanelExpose {
    focusFirst(): void;
    focusLast(): void;
    focusActive(): void;
    closeChildren(restoreFocus?: boolean): boolean;
}
export type MenuDismissReason = "select" | "tab";
export declare function menuItemDisabled(item: WlMenuItemBase | undefined): boolean;
