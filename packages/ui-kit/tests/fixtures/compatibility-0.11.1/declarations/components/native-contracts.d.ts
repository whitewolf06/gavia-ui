import { default as RawAlert } from './WlAlert.vue';
import { default as RawAvatar } from './WlAvatar.vue';
import { default as RawBadge } from './WlBadge.vue';
import { default as RawBreadcrumbs } from './WlBreadcrumbs.vue';
import { default as RawButton } from './WlButton.vue';
import { default as RawButtonGroup } from './WlButtonGroup.vue';
import { default as RawCalendar } from './WlCalendar.vue';
import { default as RawCard } from './WlCard.vue';
import { default as RawCheckbox } from './WlCheckbox.vue';
import { default as RawChip } from './WlChip.vue';
import { default as RawColorPicker } from './WlColorPicker.vue';
import { default as RawConfirmDialog } from './WlConfirmDialog.vue';
import { default as RawDialog } from './WlDialog.vue';
import { default as RawDivider } from './WlDivider.vue';
import { default as RawDrawer } from './WlDrawer.vue';
import { default as RawEmpty } from './WlEmpty.vue';
import { default as RawField } from './WlField.vue';
import { default as RawFileUpload } from './WlFileUpload.vue';
import { default as RawFilePicker } from './WlFilePicker.vue';
import { default as RawFilterBar } from './WlFilterBar.vue';
import { default as RawIcon } from './WlIcon.vue';
import { default as RawIconButton } from './WlIconButton.vue';
import { default as RawInput } from './WlInput.vue';
import { default as RawNavItem } from './WlNavItem.vue';
import { default as RawNumberInput } from './WlNumberInput.vue';
import { default as RawPagination } from './WlPagination.vue';
import { default as RawPageHeader } from './WlPageHeader.vue';
import { default as RawPasswordInput } from './WlPasswordInput.vue';
import { default as RawPill } from './WlPill.vue';
import { default as RawPopover } from './WlPopover.vue';
import { default as RawProgress } from './WlProgress.vue';
import { default as RawSkeleton } from './WlSkeleton.vue';
import { default as RawSlider } from './WlSlider.vue';
import { default as RawSpinner } from './WlSpinner.vue';
import { default as RawStatCard } from './WlStatCard.vue';
import { default as RawSteps } from './WlSteps.vue';
import { default as RawSwitch } from './WlSwitch.vue';
import { default as RawTag } from './WlTag.vue';
import { default as RawTextarea } from './WlTextarea.vue';
import { default as RawTimePicker } from './WlTimePicker.vue';
import { default as RawToast } from './WlToast.vue';
import { WlElementAttributes, WlInputAttributes, WlPasswordInputAttributes, WlTextareaAttributes, WlNumberInputAttributes, WlSliderAttributes, WlTimeInputAttributes, WlToggleAttributes, WlFileInputAttributes, WlButtonAttributes, WlLinkAttributes } from '../native-types';
/** Preserve the SFC's props, slots, events, exposed methods and static metadata. */
type ComponentConstructor = abstract new (...args: never[]) => {
    $props: object;
};
type WithNativeAttributes<Component extends ComponentConstructor, Attributes> = Pick<Component, keyof Component> & {
    new (...args: ConstructorParameters<Component>): InstanceType<Component> & {
        $props: InstanceType<Component>["$props"] & Omit<Attributes, keyof InstanceType<Component>["$props"]>;
    };
};
/** Link attributes apply only while NavItem actually renders an anchor. */
type WithNavAttributes<Props> = Props & (({
    href: string;
} & Omit<WlLinkAttributes, keyof Props | "type">) | ({
    href?: undefined;
} & Omit<WlElementAttributes, keyof Props> & {
    [Key in Exclude<keyof WlLinkAttributes, keyof WlElementAttributes | keyof Props>]?: never;
}));
type NavItemContract = Pick<typeof RawNavItem, keyof typeof RawNavItem> & {
    new (...args: ConstructorParameters<typeof RawNavItem>): InstanceType<typeof RawNavItem> & {
        $props: WithNavAttributes<InstanceType<typeof RawNavItem>["$props"]>;
    };
};
export declare const WlAlert: WithNativeAttributes<typeof RawAlert, WlElementAttributes>;
export declare const WlAvatar: WithNativeAttributes<typeof RawAvatar, WlElementAttributes>;
export declare const WlBadge: WithNativeAttributes<typeof RawBadge, WlElementAttributes>;
export declare const WlBreadcrumbs: WithNativeAttributes<typeof RawBreadcrumbs, WlElementAttributes>;
export declare const WlButton: WithNativeAttributes<typeof RawButton, WlButtonAttributes>;
export declare const WlButtonGroup: WithNativeAttributes<typeof RawButtonGroup, WlElementAttributes>;
export declare const WlCalendar: WithNativeAttributes<typeof RawCalendar, WlElementAttributes>;
export declare const WlCard: WithNativeAttributes<typeof RawCard, WlElementAttributes>;
export declare const WlCheckbox: WithNativeAttributes<typeof RawCheckbox, WlToggleAttributes>;
export declare const WlChip: WithNativeAttributes<typeof RawChip, WlElementAttributes>;
export declare const WlColorPicker: WithNativeAttributes<typeof RawColorPicker, WlElementAttributes>;
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
export declare const WlIconButton: WithNativeAttributes<typeof RawIconButton, WlButtonAttributes>;
export declare const WlInput: WithNativeAttributes<typeof RawInput, WlInputAttributes>;
export declare const WlNavItem: NavItemContract;
export declare const WlNumberInput: WithNativeAttributes<typeof RawNumberInput, WlNumberInputAttributes>;
export declare const WlPagination: WithNativeAttributes<typeof RawPagination, WlElementAttributes>;
export declare const WlPageHeader: WithNativeAttributes<typeof RawPageHeader, WlElementAttributes>;
export declare const WlPasswordInput: WithNativeAttributes<typeof RawPasswordInput, WlPasswordInputAttributes>;
export declare const WlPill: WithNativeAttributes<typeof RawPill, WlElementAttributes>;
export declare const WlPopover: WithNativeAttributes<typeof RawPopover, WlElementAttributes>;
export declare const WlProgress: WithNativeAttributes<typeof RawProgress, WlElementAttributes>;
export declare const WlSkeleton: WithNativeAttributes<typeof RawSkeleton, WlElementAttributes>;
export declare const WlSlider: WithNativeAttributes<typeof RawSlider, WlSliderAttributes>;
export declare const WlSpinner: WithNativeAttributes<typeof RawSpinner, WlElementAttributes>;
export declare const WlStatCard: WithNativeAttributes<typeof RawStatCard, WlElementAttributes>;
export declare const WlSteps: WithNativeAttributes<typeof RawSteps, WlElementAttributes>;
export declare const WlSwitch: WithNativeAttributes<typeof RawSwitch, WlToggleAttributes>;
export declare const WlTag: WithNativeAttributes<typeof RawTag, WlElementAttributes>;
export declare const WlTextarea: WithNativeAttributes<typeof RawTextarea, WlTextareaAttributes>;
export declare const WlTimePicker: WithNativeAttributes<typeof RawTimePicker, WlTimeInputAttributes>;
export declare const WlToast: WithNativeAttributes<typeof RawToast, WlElementAttributes>;
export {};
