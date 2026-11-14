import { ComponentPublicInstance } from 'vue';
import { WlActionAccessibleName, WlButtonAttributes, WlElementAttributes, WlFileInputAttributes, WlInputAttributes, WlLinkAttributes, WlNumberInputAttributes, WlPasswordInputAttributes, WlSliderAttributes, WlTextareaAttributes, WlTimeInputAttributes, WlToggleAttributes } from "../native-types.js";
import { WlPt, WlPtAttributes, WlPtContext, WlPtSection } from "../pt-types.js";
import { default as RawAlert } from "./WlAlert.vue.js";
import { default as RawAvatar } from "./WlAvatar.vue.js";
import { default as RawBadge } from "./WlBadge.vue.js";
import { default as RawBreadcrumbs } from "./WlBreadcrumbs.vue.js";
import { default as RawButton } from "./WlButton.vue.js";
import { default as RawButtonGroup } from "./WlButtonGroup.vue.js";
import { default as RawCard } from "./WlCard.vue.js";
import { default as RawCheckbox } from "./WlCheckbox.vue.js";
import { default as RawChip } from "./WlChip.vue.js";
import { default as RawColorPicker } from "./WlColorPicker.vue.js";
import { default as RawConfirmDialog } from "./WlConfirmDialog.vue.js";
import { default as RawDialog } from "./WlDialog.vue.js";
import { default as RawDivider } from "./WlDivider.vue.js";
import { default as RawDrawer } from "./WlDrawer.vue.js";
import { default as RawEmpty } from "./WlEmpty.vue.js";
import { default as RawField } from "./WlField.vue.js";
import { default as RawFilePicker } from "./WlFilePicker.vue.js";
import { default as RawFileUpload } from "./WlFileUpload.vue.js";
import { default as RawFilterBar } from "./WlFilterBar.vue.js";
import { default as RawIcon } from "./WlIcon.vue.js";
import { default as RawIconButton } from "./WlIconButton.vue.js";
import { default as RawInput } from "./WlInput.vue.js";
import { default as RawLink } from "./WlLink.vue.js";
import { default as RawNavItem } from "./WlNavItem.vue.js";
import { default as RawNumberInput } from "./WlNumberInput.vue.js";
import { default as RawPageHeader } from "./WlPageHeader.vue.js";
import { default as RawPagination } from "./WlPagination.vue.js";
import { default as RawPasswordInput } from "./WlPasswordInput.vue.js";
import { default as RawPill } from "./WlPill.vue.js";
import { default as RawPopover } from "./WlPopover.vue.js";
import { default as RawProgress } from "./WlProgress.vue.js";
import { default as RawSkeleton } from "./WlSkeleton.vue.js";
import { default as RawSlider } from "./WlSlider.vue.js";
import { default as RawSpinner } from "./WlSpinner.vue.js";
import { default as RawStatCard } from "./WlStatCard.vue.js";
import { default as RawSteps } from "./WlSteps.vue.js";
import { default as RawSwitch } from "./WlSwitch.vue.js";
import { default as RawTag } from "./WlTag.vue.js";
import { default as RawTagsInput } from "./WlTagsInput.vue.js";
import { default as RawTextarea } from "./WlTextarea.vue.js";
import { default as RawTimePicker } from "./WlTimePicker.vue.js";
import { default as RawToast } from "./WlToast.vue.js";
import { default as RawToolbar } from "./WlToolbar.vue.js";
import { default as RawTooltip } from "./WlTooltip.vue.js";
/** Preserve the SFC's props, slots, events, exposed methods and static metadata. */
type ComponentConstructor = abstract new (...args: never[]) => {
    $props: object;
};
type WithNativeAttributes<Component extends ComponentConstructor, Attributes> = Pick<Component, keyof Component> & {
    new (...args: ConstructorParameters<Component>): InstanceType<Component> & {
        $props: InstanceType<Component>["$props"] & Omit<Attributes, keyof InstanceType<Component>["$props"]>;
    };
};
type ActionLinkSelector<Props> = {
    href: string;
} | {
    to: {} | null;
} | ("as" extends keyof Props ? {
    as: "a";
} : never);
type ActionButtonSelector<Props> = {
    href?: undefined;
    to?: undefined;
} & ("as" extends keyof Props ? {
    as?: "button";
} : unknown);
/** Native attributes follow the actual button/anchor rendering mode. */
type WithActionAttributes<Props> = Props & ((ActionLinkSelector<Props> & Omit<WlLinkAttributes, keyof Props | "type"> & ("type" extends keyof Props ? unknown : {
    type?: never;
}) & {
    [Key in Exclude<keyof WlButtonAttributes, keyof WlLinkAttributes | keyof Props>]?: never;
}) | (ActionButtonSelector<Props> & Omit<WlButtonAttributes, keyof Props> & {
    [Key in Exclude<keyof WlLinkAttributes, keyof WlButtonAttributes | keyof Props>]?: never;
}));
type ActionContract<Component extends ComponentConstructor> = Pick<Component, keyof Component> & {
    new (...args: ConstructorParameters<Component>): Omit<InstanceType<Component>, "$props"> & {
        $props: WithActionAttributes<InstanceType<Component>["$props"]>;
    };
};
type IconButtonBaseProps = WithActionAttributes<InstanceType<typeof RawIconButton>["$props"]>;
type IconButtonNamedPt = {
    pt: WlPt<"iconButton"> & {
        root: WlPtSection<WlPtContext, WlPtAttributes & ({
            "aria-label": string;
        } | {
            "aria-labelledby": string;
        })>;
    };
};
type IconButtonNamedProps = IconButtonBaseProps & (WlActionAccessibleName | IconButtonNamedPt);
/** With no icon prop, the default slot supplies the action text (and may include a custom icon). */
type IconButtonTextProps = IconButtonBaseProps & {
    icon?: undefined;
};
type IconButtonSlots = InstanceType<typeof RawIconButton>["$slots"];
type IconButtonProps = IconButtonNamedProps | IconButtonTextProps;
type IconButtonInstance<Props extends IconButtonProps = IconButtonProps> = Omit<InstanceType<typeof RawIconButton>, "$props" | "$slots"> & {
    $props: Props;
    $slots: IconButtonSlots & (Props extends IconButtonNamedProps ? unknown : {
        default: NonNullable<IconButtonSlots["default"]>;
    });
};
type IconButtonContract = Pick<typeof RawIconButton, keyof typeof RawIconButton> & {
    new <Props extends IconButtonProps>(props: Props): IconButtonInstance<Props>;
};
/** Link attributes apply only while NavItem actually renders an anchor. */
type WithNavAttributes<Props> = Props & (({
    href: string;
} & Omit<WlLinkAttributes, keyof Props | "type">) | ({
    to: {} | null;
} & Omit<WlLinkAttributes, keyof Props | "type">) | ({
    href?: undefined;
    to?: undefined;
} & Omit<WlElementAttributes, keyof Props> & {
    [Key in Exclude<keyof WlLinkAttributes, keyof WlElementAttributes | keyof Props>]?: never;
}));
type NavItemContract = Pick<typeof RawNavItem, keyof typeof RawNavItem> & {
    new (...args: ConstructorParameters<typeof RawNavItem>): InstanceType<typeof RawNavItem> & {
        $props: WithNavAttributes<InstanceType<typeof RawNavItem>["$props"]>;
    };
};
type SliderBaseProps = Omit<InstanceType<typeof RawSlider>["$props"], "range" | "modelValue" | "onUpdate:modelValue">;
type SliderProps = SliderBaseProps & ({
    range?: false;
    modelValue?: number;
    "onUpdate:modelValue"?: (value: number) => void;
} | {
    range: true;
    modelValue?: [number, number];
    "onUpdate:modelValue"?: (value: [number, number]) => void;
});
type SliderContract = Pick<typeof RawSlider, keyof typeof RawSlider> & {
    new (...args: ConstructorParameters<typeof RawSlider>): Omit<InstanceType<typeof RawSlider>, "$props"> & {
        $props: SliderProps & Omit<WlSliderAttributes, keyof SliderBaseProps>;
    };
};
type DeclaredProps<Props> = {
    [Key in keyof Props as string extends Key ? never : number extends Key ? never : Key]: Props[Key];
};
type CheckboxSfcProps<Value> = DeclaredProps<Parameters<typeof RawCheckbox<Value>>[0]>;
type CheckboxProps<Value = undefined> = CheckboxSfcProps<Value> & Omit<WlToggleAttributes, keyof CheckboxSfcProps<Value>> & ([Value] extends [undefined] ? unknown : {
    value: Value;
});
type CheckboxInstance<Value> = Omit<ComponentPublicInstance, "$props" | "$slots" | "$emit"> & {
    $props: CheckboxProps<Value>;
    $slots: NonNullable<ReturnType<typeof RawCheckbox<Value>>["__ctx"]>["slots"];
    $emit: NonNullable<ReturnType<typeof RawCheckbox<Value>>["__ctx"]>["emit"];
};
type CheckboxVueArguments<T extends readonly unknown[]> = T extends readonly [unknown, ...infer Rest] ? Rest : never;
type CheckboxContract = {
    new <Value>(props: {
        value: Value;
    } & Omit<CheckboxProps<Value>, "modelValue" | "onUpdate:modelValue">): CheckboxInstance<Value>;
    new (props: CheckboxProps<undefined>): CheckboxInstance<undefined>;
    <Value = undefined>(props: CheckboxProps<Value>, ...vue: CheckboxVueArguments<Parameters<typeof RawCheckbox<Value>>>): ReturnType<typeof RawCheckbox<Value>>;
};
export declare const WlAlert: WithNativeAttributes<typeof RawAlert, WlElementAttributes>;
export declare const WlAvatar: WithNativeAttributes<typeof RawAvatar, WlElementAttributes>;
export declare const WlBadge: WithNativeAttributes<typeof RawBadge, WlElementAttributes>;
export declare const WlBreadcrumbs: WithNativeAttributes<typeof RawBreadcrumbs, WlElementAttributes>;
export declare const WlButton: ActionContract<typeof RawButton>;
export declare const WlButtonGroup: WithNativeAttributes<typeof RawButtonGroup, WlElementAttributes>;
export declare const WlCard: WithNativeAttributes<typeof RawCard, WlElementAttributes>;
export declare const WlCheckbox: CheckboxContract;
export declare const WlChip: WithNativeAttributes<typeof RawChip, WlElementAttributes>;
export declare const WlColorPicker: WithNativeAttributes<typeof RawColorPicker, WlInputAttributes>;
export declare const WlConfirmDialog: WithNativeAttributes<typeof RawConfirmDialog, WlElementAttributes>;
export declare const WlDialog: WithNativeAttributes<typeof RawDialog, WlElementAttributes>;
export declare const WlDivider: WithNativeAttributes<typeof RawDivider, WlElementAttributes>;
export declare const WlDrawer: WithNativeAttributes<typeof RawDrawer, WlElementAttributes>;
export declare const WlEmpty: WithNativeAttributes<typeof RawEmpty, WlElementAttributes>;
export declare const WlField: WithNativeAttributes<typeof RawField, WlElementAttributes>;
export declare const WlFileUpload: WithNativeAttributes<typeof RawFileUpload, WlElementAttributes>;
export declare const WlFilePicker: WithNativeAttributes<typeof RawFilePicker, WlFileInputAttributes>;
export declare const WlFilterBar: WithNativeAttributes<typeof RawFilterBar, WlElementAttributes>;
export declare const WlIcon: WithNativeAttributes<typeof RawIcon, WlElementAttributes>;
export declare const WlIconButton: IconButtonContract;
export declare const WlInput: WithNativeAttributes<typeof RawInput, WlInputAttributes>;
export declare const WlLink: WithNativeAttributes<typeof RawLink, WlLinkAttributes>;
export declare const WlNavItem: NavItemContract;
export declare const WlNumberInput: WithNativeAttributes<typeof RawNumberInput, WlNumberInputAttributes>;
export declare const WlPagination: WithNativeAttributes<typeof RawPagination, WlElementAttributes>;
export declare const WlPageHeader: WithNativeAttributes<typeof RawPageHeader, WlElementAttributes>;
export declare const WlPasswordInput: WithNativeAttributes<typeof RawPasswordInput, WlPasswordInputAttributes>;
export declare const WlPill: WithNativeAttributes<typeof RawPill, WlElementAttributes>;
export declare const WlPopover: WithNativeAttributes<typeof RawPopover, WlElementAttributes>;
export declare const WlProgress: WithNativeAttributes<typeof RawProgress, WlElementAttributes>;
export declare const WlSkeleton: WithNativeAttributes<typeof RawSkeleton, WlElementAttributes>;
export declare const WlSlider: SliderContract;
export declare const WlSpinner: WithNativeAttributes<typeof RawSpinner, WlElementAttributes>;
export declare const WlStatCard: WithNativeAttributes<typeof RawStatCard, WlElementAttributes>;
export declare const WlSteps: WithNativeAttributes<typeof RawSteps, WlElementAttributes>;
export declare const WlSwitch: WithNativeAttributes<typeof RawSwitch, WlToggleAttributes>;
export declare const WlTag: WithNativeAttributes<typeof RawTag, WlElementAttributes>;
export declare const WlTextarea: WithNativeAttributes<typeof RawTextarea, WlTextareaAttributes>;
export declare const WlTimePicker: WithNativeAttributes<typeof RawTimePicker, WlTimeInputAttributes>;
export declare const WlToast: WithNativeAttributes<typeof RawToast, WlElementAttributes>;
export declare const WlToolbar: WithNativeAttributes<typeof RawToolbar, WlElementAttributes>;
export declare const WlTagsInput: WithNativeAttributes<typeof RawTagsInput, WlInputAttributes>;
export declare const WlTooltip: WithNativeAttributes<typeof RawTooltip, WlElementAttributes>;
export {};
