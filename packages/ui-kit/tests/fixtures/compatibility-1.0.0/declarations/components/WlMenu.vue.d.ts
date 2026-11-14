import { WlMenuCheckEvent, WlMenuItem, WlMenuItemBase, WlMenuTriggerSlotProps } from "../navigation-types.js";
import { WlPopoverAlign, WlPopoverPlacement } from "../overlay-types.js";
import { WlPt } from "../pt-types.js";
declare const __VLS_export: <Item extends WlMenuItemBase = WlMenuItem>(__VLS_props: NonNullable<Awaited<typeof __VLS_setup>>["props"], __VLS_ctx?: __VLS_PrettifyLocal<Pick<NonNullable<Awaited<typeof __VLS_setup>>, "attrs" | "emit" | "slots">>, __VLS_exposed?: NonNullable<Awaited<typeof __VLS_setup>>["expose"], __VLS_setup?: Promise<{
    props: import('vue').PublicProps & __VLS_PrettifyLocal<{
        /**
         * WlMenuItem[]: { key?, label?, icon?, shortcut?, danger?, disabled?, separator?, header?, command? }.
         * @default []
         */
        items?: readonly (Item & WlMenuItem<NoInfer<Item>>)[];
        /**
         * Popup menu; opened through toggle/show.
         * @default false
         */
        popup?: boolean;
        /**
         * Preferred overlay side relative to its anchor.
         * @default "auto"
         */
        placement?: WlPopoverPlacement;
        /**
         * Alignment of the overlay along its anchor.
         * @default "start"
         */
        align?: WlPopoverAlign;
        /** Accessible menu name. */
        ariaLabel?: string;
        /** ID of the element labelling the menu. */
        ariaLabelledby?: string;
        /** Popup menu animation; defaults to WlConfig.motion (true). */
        motion?: boolean;
        /** Attributes of internal Gavia UI elements. */
        pt?: WlPt<"menu">;
    } & {
        onCheck?: ((event: WlMenuCheckEvent<Item>) => any) | undefined;
        onClose?: (() => any) | undefined;
        onOpen?: (() => any) | undefined;
    }> & (typeof globalThis extends {
        __VLS_PROPS_FALLBACK: infer P;
    } ? P : {});
    expose: (exposed: import('vue').ShallowUnwrapRef<{
        toggle: (event?: Event) => void;
        show: (event?: Event) => void;
        hide: (event?: Event) => void;
    }>) => void;
    attrs: any;
    slots: {
        /** Custom trigger; bind its supplied attributes and use the provided open/close actions. */
        trigger?(props: WlMenuTriggerSlotProps): unknown;
    };
    emit: ((evt: "check", event: WlMenuCheckEvent<Item>) => void) & ((evt: "close") => void) & ((evt: "open") => void);
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
