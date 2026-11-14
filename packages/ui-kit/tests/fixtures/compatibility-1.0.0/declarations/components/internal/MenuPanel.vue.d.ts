import { WlMenuCheckEvent, WlMenuItem, WlMenuItemBase } from "../../navigation-types.js";
import { WlPt } from "../../pt-types.js";
import { MenuDismissReason, MenuEntry } from "../../utils/menu.js";
declare const __VLS_export: <Item extends WlMenuItemBase = WlMenuItem>(__VLS_props: NonNullable<Awaited<typeof __VLS_setup>>["props"], __VLS_ctx?: __VLS_PrettifyLocal<Pick<NonNullable<Awaited<typeof __VLS_setup>>, "attrs" | "emit" | "slots">>, __VLS_exposed?: NonNullable<Awaited<typeof __VLS_setup>>["expose"], __VLS_setup?: Promise<{
    props: import('vue').PublicProps & __VLS_PrettifyLocal<{
        items: readonly MenuEntry<Item>[];
        id: string;
        ariaLabel?: string;
        ariaLabelledby?: string;
        submenu?: boolean;
        motion?: boolean;
        pt?: WlPt<"menu">;
    } & {
        onCheck?: ((event: WlMenuCheckEvent<Item>) => any) | undefined;
        onDismiss?: ((reason: MenuDismissReason) => any) | undefined;
        onCloseParent?: (() => any) | undefined;
    }> & (typeof globalThis extends {
        __VLS_PROPS_FALLBACK: infer P;
    } ? P : {});
    expose: (exposed: import('vue').ShallowUnwrapRef<{
        focusFirst: () => void;
        focusLast: () => void;
        focusActive: () => void;
        closeChildren: (restoreFocus?: boolean) => boolean;
    }>) => void;
    attrs: any;
    slots: {};
    emit: ((evt: "check", event: WlMenuCheckEvent<Item>) => void) & ((evt: "dismiss", reason: MenuDismissReason) => void) & ((evt: "closeParent") => void);
}>) => import('vue').VNode & {
    __ctx?: NonNullable<Awaited<typeof __VLS_setup>>;
};
declare const _default: typeof __VLS_export;
export default _default;
type __VLS_PrettifyLocal<T> = (T extends any ? {
    [K in keyof T]: T[K];
} : {
    [K in keyof T as K]: T[K];
}) & {};
