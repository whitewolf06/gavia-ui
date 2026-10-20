import type { ComponentPublicInstance } from "vue";
import type { WlButtonAttributes, WlElementAttributes, WlFileInputAttributes, WlInputAttributes, WlLinkAttributes, WlNumberInputAttributes, WlPasswordInputAttributes, WlSliderAttributes, WlTextareaAttributes, WlTimeInputAttributes, WlToggleAttributes } from "../native-types";
import RawAlert from "./WlAlert.vue";
import RawAvatar from "./WlAvatar.vue";
import RawBadge from "./WlBadge.vue";
import RawBreadcrumbs from "./WlBreadcrumbs.vue";
import RawButton from "./WlButton.vue";
import RawButtonGroup from "./WlButtonGroup.vue";
import RawCard from "./WlCard.vue";
import RawCheckbox from "./WlCheckbox.vue";
import RawChip from "./WlChip.vue";
import RawColorPicker from "./WlColorPicker.vue";
import RawConfirmDialog from "./WlConfirmDialog.vue";
import RawDialog from "./WlDialog.vue";
import RawDivider from "./WlDivider.vue";
import RawDrawer from "./WlDrawer.vue";
import RawEmpty from "./WlEmpty.vue";
import RawField from "./WlField.vue";
import RawFilePicker from "./WlFilePicker.vue";
import RawFileUpload from "./WlFileUpload.vue";
import RawFilterBar from "./WlFilterBar.vue";
import RawIcon from "./WlIcon.vue";
import RawIconButton from "./WlIconButton.vue";
import RawInput from "./WlInput.vue";
import RawLink from "./WlLink.vue";
import RawNavItem from "./WlNavItem.vue";
import RawNumberInput from "./WlNumberInput.vue";
import RawPageHeader from "./WlPageHeader.vue";
import RawPagination from "./WlPagination.vue";
import RawPasswordInput from "./WlPasswordInput.vue";
import RawPill from "./WlPill.vue";
import RawPopover from "./WlPopover.vue";
import RawProgress from "./WlProgress.vue";
import RawSkeleton from "./WlSkeleton.vue";
import RawSlider from "./WlSlider.vue";
import RawSpinner from "./WlSpinner.vue";
import RawStatCard from "./WlStatCard.vue";
import RawSteps from "./WlSteps.vue";
import RawSwitch from "./WlSwitch.vue";
import RawTag from "./WlTag.vue";
import RawTagsInput from "./WlTagsInput.vue";
import RawTextarea from "./WlTextarea.vue";
import RawTimePicker from "./WlTimePicker.vue";
import RawToast from "./WlToast.vue";
import RawToolbar from "./WlToolbar.vue";
import RawTooltipComponent from "./WlTooltipComponent.vue";

/** Preserve the SFC's props, slots, events, exposed methods and static metadata. */
type ComponentConstructor = abstract new (...args: never[]) => { $props: object };
type WithNativeAttributes<Component extends ComponentConstructor, Attributes> = Pick<Component, keyof Component> & {
  new (...args: ConstructorParameters<Component>): InstanceType<Component> & {
    $props: InstanceType<Component>["$props"] & Omit<Attributes, keyof InstanceType<Component>["$props"]>;
  };
};

type ActionLinkSelector<Props> = { href: string } | { to: {} | null } | ("as" extends keyof Props ? { as: "a" } : never);
type ActionButtonSelector<Props> = { href?: undefined; to?: undefined } & ("as" extends keyof Props ? { as?: "button" } : unknown);
/** Native attributes follow the actual button/anchor rendering mode. */
type WithActionAttributes<Props> = Props & (
  | (ActionLinkSelector<Props> & Omit<WlLinkAttributes, keyof Props | "type">
    & ("type" extends keyof Props ? unknown : { type?: never })
    & { [Key in Exclude<keyof WlButtonAttributes, keyof WlLinkAttributes | keyof Props>]?: never })
  | (ActionButtonSelector<Props> & Omit<WlButtonAttributes, keyof Props>
    & { [Key in Exclude<keyof WlLinkAttributes, keyof WlButtonAttributes | keyof Props>]?: never })
);
type ActionContract<Component extends ComponentConstructor> = Pick<Component, keyof Component> & {
  new (...args: ConstructorParameters<Component>): Omit<InstanceType<Component>, "$props"> & {
    $props: WithActionAttributes<InstanceType<Component>["$props"]>;
  };
};

/** Link attributes apply only while NavItem actually renders an anchor. */
type WithNavAttributes<Props> = Props & (
  | ({ href: string } & Omit<WlLinkAttributes, keyof Props | "type">)
  | ({ to: {} | null } & Omit<WlLinkAttributes, keyof Props | "type">)
  | ({ href?: undefined; to?: undefined } & Omit<WlElementAttributes, keyof Props>
    & { [Key in Exclude<keyof WlLinkAttributes, keyof WlElementAttributes | keyof Props>]?: never })
);
type NavItemContract = Pick<typeof RawNavItem, keyof typeof RawNavItem> & {
  new (...args: ConstructorParameters<typeof RawNavItem>): InstanceType<typeof RawNavItem> & {
    $props: WithNavAttributes<InstanceType<typeof RawNavItem>["$props"]>;
  };
};

type SliderBaseProps = Omit<InstanceType<typeof RawSlider>["$props"], "range" | "modelValue" | "onUpdate:modelValue">;
type SliderProps = SliderBaseProps & (
  | { range?: false; modelValue?: number; "onUpdate:modelValue"?: (value: number) => void }
  | { range: true; modelValue?: [number, number]; "onUpdate:modelValue"?: (value: [number, number]) => void }
);
type SliderContract = Pick<typeof RawSlider, keyof typeof RawSlider> & {
  new (...args: ConstructorParameters<typeof RawSlider>): Omit<InstanceType<typeof RawSlider>, "$props"> & {
    $props: SliderProps & Omit<WlSliderAttributes, keyof SliderBaseProps>;
  };
};

type CheckboxProps<Value = undefined> = Parameters<typeof RawCheckbox<Value>>[0]
  & Omit<WlToggleAttributes, keyof Parameters<typeof RawCheckbox<Value>>[0]>
  & ([Value] extends [undefined] ? unknown : { value: Value });
type CheckboxInstance<Value> = Omit<ComponentPublicInstance, "$props" | "$slots" | "$emit"> & {
  $props: CheckboxProps<Value>;
  $slots: NonNullable<ReturnType<typeof RawCheckbox<Value>>["__ctx"]>["slots"];
  $emit: NonNullable<ReturnType<typeof RawCheckbox<Value>>["__ctx"]>["emit"];
};
type CheckboxVueArguments<T extends readonly unknown[]> = T extends readonly [unknown, ...infer Rest] ? Rest : never;
type CheckboxContract = {
  new<Value>(props: { value: Value } & Omit<CheckboxProps<Value>, "modelValue" | "onUpdate:modelValue">): CheckboxInstance<Value>;
  // Utilities and existing binary consumers retain the released default model view.
  new(props: CheckboxProps<undefined>): CheckboxInstance<undefined>;
  <Value = undefined>(
    props: CheckboxProps<Value>, ...vue: CheckboxVueArguments<Parameters<typeof RawCheckbox<Value>>>
  ): ReturnType<typeof RawCheckbox<Value>>;
};

// Type-only views of the original SFC objects. No wrapper, runtime props or DOM changes.
export const WlAlert = RawAlert as unknown as WithNativeAttributes<typeof RawAlert, WlElementAttributes>;
export const WlAvatar = RawAvatar as unknown as WithNativeAttributes<typeof RawAvatar, WlElementAttributes>;
export const WlBadge = RawBadge as unknown as WithNativeAttributes<typeof RawBadge, WlElementAttributes>;
export const WlBreadcrumbs = RawBreadcrumbs as unknown as WithNativeAttributes<typeof RawBreadcrumbs, WlElementAttributes>;
export const WlButton = RawButton as unknown as ActionContract<typeof RawButton>;
export const WlButtonGroup = RawButtonGroup as unknown as WithNativeAttributes<typeof RawButtonGroup, WlElementAttributes>;
export const WlCard = RawCard as unknown as WithNativeAttributes<typeof RawCard, WlElementAttributes>;
export const WlCheckbox = RawCheckbox as unknown as CheckboxContract;
export const WlChip = RawChip as unknown as WithNativeAttributes<typeof RawChip, WlElementAttributes>;
export const WlColorPicker = RawColorPicker as unknown as WithNativeAttributes<typeof RawColorPicker, WlInputAttributes>;
export const WlConfirmDialog = RawConfirmDialog as unknown as WithNativeAttributes<typeof RawConfirmDialog, WlElementAttributes>;
export const WlDialog = RawDialog as unknown as WithNativeAttributes<typeof RawDialog, WlElementAttributes>;
export const WlDivider = RawDivider as unknown as WithNativeAttributes<typeof RawDivider, WlElementAttributes>;
export const WlDrawer = RawDrawer as unknown as WithNativeAttributes<typeof RawDrawer, WlElementAttributes>;
export const WlEmpty = RawEmpty as unknown as WithNativeAttributes<typeof RawEmpty, WlElementAttributes>;
export const WlField = RawField as unknown as WithNativeAttributes<typeof RawField, WlElementAttributes>;
export const WlFileUpload = RawFileUpload as unknown as WithNativeAttributes<typeof RawFileUpload, WlElementAttributes>;
export const WlFilePicker = RawFilePicker as unknown as WithNativeAttributes<typeof RawFilePicker, WlFileInputAttributes>;
export const WlFilterBar = RawFilterBar as unknown as WithNativeAttributes<typeof RawFilterBar, WlElementAttributes>;
export const WlIcon = RawIcon as unknown as WithNativeAttributes<typeof RawIcon, WlElementAttributes>;
export const WlIconButton = RawIconButton as unknown as ActionContract<typeof RawIconButton>;
export const WlInput = RawInput as unknown as WithNativeAttributes<typeof RawInput, WlInputAttributes>;
export const WlLink = RawLink as unknown as WithNativeAttributes<typeof RawLink, WlLinkAttributes>;
export const WlNavItem = RawNavItem as unknown as NavItemContract;
export const WlNumberInput = RawNumberInput as unknown as WithNativeAttributes<typeof RawNumberInput, WlNumberInputAttributes>;
export const WlPagination = RawPagination as unknown as WithNativeAttributes<typeof RawPagination, WlElementAttributes>;
export const WlPageHeader = RawPageHeader as unknown as WithNativeAttributes<typeof RawPageHeader, WlElementAttributes>;
export const WlPasswordInput = RawPasswordInput as unknown as WithNativeAttributes<typeof RawPasswordInput, WlPasswordInputAttributes>;
export const WlPill = RawPill as unknown as WithNativeAttributes<typeof RawPill, WlElementAttributes>;
export const WlPopover = RawPopover as unknown as WithNativeAttributes<typeof RawPopover, WlElementAttributes>;
export const WlProgress = RawProgress as unknown as WithNativeAttributes<typeof RawProgress, WlElementAttributes>;
export const WlSkeleton = RawSkeleton as unknown as WithNativeAttributes<typeof RawSkeleton, WlElementAttributes>;
export const WlSlider = RawSlider as unknown as SliderContract;
export const WlSpinner = RawSpinner as unknown as WithNativeAttributes<typeof RawSpinner, WlElementAttributes>;
export const WlStatCard = RawStatCard as unknown as WithNativeAttributes<typeof RawStatCard, WlElementAttributes>;
export const WlSteps = RawSteps as unknown as WithNativeAttributes<typeof RawSteps, WlElementAttributes>;
export const WlSwitch = RawSwitch as unknown as WithNativeAttributes<typeof RawSwitch, WlToggleAttributes>;
export const WlTag = RawTag as unknown as WithNativeAttributes<typeof RawTag, WlElementAttributes>;
export const WlTextarea = RawTextarea as unknown as WithNativeAttributes<typeof RawTextarea, WlTextareaAttributes>;
export const WlTimePicker = RawTimePicker as unknown as WithNativeAttributes<typeof RawTimePicker, WlTimeInputAttributes>;
export const WlToast = RawToast as unknown as WithNativeAttributes<typeof RawToast, WlElementAttributes>;
export const WlToolbar = RawToolbar as unknown as WithNativeAttributes<typeof RawToolbar, WlElementAttributes>;
export const WlTagsInput = RawTagsInput as unknown as WithNativeAttributes<typeof RawTagsInput, WlInputAttributes>;
export const WlTooltipComponent = RawTooltipComponent as unknown as WithNativeAttributes<typeof RawTooltipComponent, WlElementAttributes>;
