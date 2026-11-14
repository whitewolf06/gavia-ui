import { WlMenuCheckEvent, WlMenuItem, WlMenuItemBase, WlMenuTriggerSlotProps } from "../navigation-types.js";
import { WlPopoverAlign, WlPopoverPlacement } from "../overlay-types.js";
import { WlPt } from "../pt-types.js";
declare const __VLS_export: <Item extends WlMenuItemBase = WlMenuItem>(__VLS_props: NonNullable<Awaited<typeof __VLS_setup>>["props"], __VLS_ctx?: __VLS_PrettifyLocal<Pick<NonNullable<Awaited<typeof __VLS_setup>>, "attrs" | "emit" | "slots">>, __VLS_exposed?: NonNullable<Awaited<typeof __VLS_setup>>["expose"], __VLS_setup?: Promise<{
    props: import('vue').PublicProps & __VLS_PrettifyLocal<{
        /**
         * Readonly item descriptors rendered by this component.
         * @default []
         */
        items?: readonly (Item & WlMenuItem<NoInfer<Item>>)[];
        /**
         * Disable user interaction with this component.
         * @default false
         */
        disabled?: boolean;
        /**
         * Preferred overlay side relative to its anchor.
         * @default "bottom"
         */
        placement?: WlPopoverPlacement;
        /**
         * Alignment of the overlay along its anchor.
         * @default "start"
         */
        align?: WlPopoverAlign;
        /** Accessible name when an external label is not referenced. */
        ariaLabel?: string;
        /** ID or space-separated IDs of elements naming this component. */
        ariaLabelledby?: string;
        /** Enable motion locally, with application defaults and reduced-motion preferences respected. */
        motion?: boolean;
        /** Attributes and callbacks for the component's documented pass-through sections. */
        pt?: WlPt<"contextmenu">;
        /** Pass-through attributes for the context menu's menu panel. */
        menuPt?: WlPt<"menu">;
    } & {
        onCheck?: ((event: WlMenuCheckEvent<Item>) => any) | undefined;
        onClose?: (() => any) | undefined;
        onOpen?: (() => any) | undefined;
    }> & (typeof globalThis extends {
        __VLS_PROPS_FALLBACK: infer P;
    } ? P : {});
    expose: (exposed: import('vue').ShallowUnwrapRef<{
        show: (event?: Event) => void;
        hide: (event?: Event) => void;
        toggle: (event?: Event) => void;
    }>) => void;
    attrs: any;
    slots: {
        /** Content of the default focusable context-menu trigger. */
        default?(props: Record<never, never>): unknown;
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
