import { type WlButton, type WlCheckbox, type WlDatePicker, type WlField, type WlFieldSlotProps, type WlFilePicker, type WlFilePickerExpose, type WlIconButton, type WlInput, type WlNavItem, type WlNumberInput, type WlSelect, type WlTextarea } from "../../src";

type InputProps = InstanceType<typeof WlInput>["$props"];
type TextareaProps = InstanceType<typeof WlTextarea>["$props"];
type NumberProps = InstanceType<typeof WlNumberInput>["$props"];
type ButtonProps = InstanceType<typeof WlButton>["$props"];
type CheckboxProps = InstanceType<typeof WlCheckbox>["$props"];
type SelectProps = Parameters<typeof WlSelect<string>>[0];
type NavProps = InstanceType<typeof WlNavItem>["$props"];
type DateProps = Parameters<typeof WlDatePicker<"single">>[0];
type IconButtonProps = InstanceType<typeof WlIconButton>["$props"];

export function nativeConsumerContracts(): void {
  const input: InputProps = { name: "title", required: true, maxlength: 80, autocomplete: "off", "aria-describedby": "help", "data-testid": "title", onInput: (event) => {
    event.preventDefault();
  }, onKeydown: (event) => {
    event.key.toUpperCase();
  }, modelModifiers: { trim: true } };
  const textarea: TextareaProps = { rows: 6, cols: 40, wrap: "soft", name: "description", onFocus: (event) => {
    void event.relatedTarget;
  } };
  const number: NumberProps = { inputmode: "decimal", name: "amount", min: 0, max: 10, step: 0.5, modelValue: 1 };
  const button: ButtonProps = { form: "project", type: "submit", onClick: (event) => {
    event.button.toFixed();
  } };
  const checkbox: CheckboxProps = { name: "consent", required: true, "aria-label": "Consent", onKeydown: (event) => {
    event.key.toUpperCase();
  } };
  // @ts-expect-error Native checkbox key listeners receive a KeyboardEvent.
  const badCheckboxListener: CheckboxProps = { onKeydown: (event: string) => event.toUpperCase() };
  const select: SelectProps = { options: ["One"], name: "choice", "aria-label": "Choice" };
  const date: DateProps = { name: "date", required: true, "aria-describedby": "date-help" };
  // @ts-expect-error Native event listeners receive events, not field text.
  const badInput: InputProps = { onInput: (value: string) => {
    value.toUpperCase();
  } };
  // @ts-expect-error Native number input attributes are numeric, not arbitrary objects.
  const badNumber: NumberProps = { step: { amount: 1 } };
  // @ts-expect-error Kit size stays its enum; the native input size does not override it.
  const badSize: InputProps = { size: 80 };
  // @ts-expect-error A proxy combobox is not a native text input with maxlength support.
  const badSelect: SelectProps = { options: ["One"], maxlength: 80 };
  // @ts-expect-error The component model owns its native value.
  const controlled: InputProps = { value: "alternate" };
  const navLink: NavProps = { href: "https://example.com", target: "_blank", rel: "noopener" };
  const navButton: NavProps = { label: "Open", onClick: (event) => {
    event.button.toFixed();
  } };
  // @ts-expect-error An anchor target needs an actual link, not a navigation button.
  const badNav: NavProps = { target: "_blank" };
  const linkAttrsWithoutHref = { label: "Open", target: "_blank" };
  // @ts-expect-error Link-only attributes also require href in a non-fresh variable.
  const badNavVariable: NavProps = linkAttrsWithoutHref;
  void [navLink, navButton, badNav, badNavVariable];
  const field = {} as InstanceType<typeof WlField>;
  const scope = {} as WlFieldSlotProps;
  field.$slots.default?.(scope);
  scope.inputId.toUpperCase();
  scope.invalid.valueOf();
  // @ts-expect-error Field descriptions can be absent.
  scope.ariaDescribedby.toUpperCase();
  const picker = {} as InstanceType<typeof WlFilePicker> & WlFilePickerExpose;
  picker.choose();

  picker.clear();
  // @ts-expect-error Choosing a local file does not upload it.
  picker.upload();
  const namedIcon: IconButtonProps = { icon: "bell", ariaLabel: "Inbox", count: 3 };
  const nativeNamedIcon: IconButtonProps = { icon: "bell", "aria-label": "Inbox" };
  const labelledIcon: IconButtonProps = { icon: "bell", "aria-labelledby": "inbox-label", href: "/inbox", target: "_blank" };
  const ptNamedIcon: IconButtonProps = { icon: "bell", pt: { root: { "aria-label": "Inbox" } } };
  const callbackNamedIcon: IconButtonProps = { icon: "bell", pt: { root: ({ context }) => ({ "aria-label": context.active ? "Close inbox" : "Open inbox" }) } };
  // The no-icon branch uses the required default slot for action text and an optional custom icon.
  const textSlotIcon: IconButtonProps = { loading: true };
  // @ts-expect-error The icon prop requires an action name.
  const unnamedIcon: IconButtonProps = { icon: "bell" };
  // @ts-expect-error Badge text describes status and cannot name the action.
  const badgeOnlyIcon: IconButtonProps = { icon: "bell", count: 3, countLabel: "Three unread messages" };
  // @ts-expect-error Tooltip/help descriptions do not supply an action name.
  const describedIcon: IconButtonProps = { icon: "bell", "aria-describedby": "inbox-help" };
  // @ts-expect-error An unlabelled root does not satisfy the action-name contract.
  const styledOnlyIcon: IconButtonProps = { icon: "bell", pt: { root: { class: "project-action" } } };
  void [namedIcon, nativeNamedIcon, labelledIcon, ptNamedIcon, callbackNamedIcon,
    textSlotIcon, unnamedIcon, badgeOnlyIcon, describedIcon, styledOnlyIcon];
  void [input, textarea, number, button, checkbox, badCheckboxListener, select, date, badInput, badNumber, badSize, badSelect, controlled];
}
