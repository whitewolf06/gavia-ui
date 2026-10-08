import { WlButton, WlCheckbox, WlDatePicker, WlInput, WlNumberInput, WlSelect, WlTextarea, WlField, WlFilePicker, WlNavItem, type WlFieldSlotProps, type WlFilePickerExpose } from "../src";

type InputProps = InstanceType<typeof WlInput>["$props"];
type TextareaProps = InstanceType<typeof WlTextarea>["$props"];
type NumberProps = InstanceType<typeof WlNumberInput>["$props"];
type ButtonProps = InstanceType<typeof WlButton>["$props"];
type CheckboxProps = InstanceType<typeof WlCheckbox>["$props"];
type SelectProps = Parameters<typeof WlSelect<string>>[0];
type NavProps = InstanceType<typeof WlNavItem>["$props"];
type DateProps = Parameters<typeof WlDatePicker<"single">>[0];

export function nativeConsumerContracts(): void {
  const input: InputProps = { name: "title", required: true, maxlength: 80, autocomplete: "off", "aria-describedby": "help", "data-testid": "title", onInput: (event) => { event.preventDefault(); }, onKeydown: (event) => { event.key.toUpperCase(); }, modelModifiers: { trim: true } };
  const textarea: TextareaProps = { rows: 6, cols: 40, wrap: "soft", name: "description", onFocus: (event) => { event.relatedTarget; } };
  const number: NumberProps = { inputmode: "decimal", name: "amount", min: 0, max: 10, step: 0.5, modelValue: 1 };
  const button: ButtonProps = { form: "project", type: "submit", onClick: (event) => { event.button.toFixed(); } };
  const checkbox: CheckboxProps = { name: "consent", required: true, "aria-label": "Consent", onKeydown: (event) => { event.key.toUpperCase(); } };
  const select: SelectProps = { options: ["One"], name: "choice", "aria-label": "Choice" };
  const date: DateProps = { name: "date", required: true, "aria-describedby": "date-help" };
  // @ts-expect-error Native event listeners receive events, not field text.
  const badInput: InputProps = { onInput: (value: string) => { value.toUpperCase(); } };
  // @ts-expect-error Native number input attributes are numeric, not arbitrary objects.
  const badNumber: NumberProps = { step: { amount: 1 } };
  // @ts-expect-error Kit size stays its enum; the native input size does not override it.
  const badSize: InputProps = { size: 80 };
  // @ts-expect-error A proxy combobox is not a native text input with maxlength support.
  const badSelect: SelectProps = { options: ["One"], maxlength: 80 };
  // @ts-expect-error The component model owns its native value.
  const controlled: InputProps = { value: "alternate" };
  const navLink: NavProps = { href: "https://example.com", target: "_blank", rel: "noopener" };
  const navButton: NavProps = { label: "Open", onClick: (event) => { event.button.toFixed(); } };
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
  picker.choose(); picker.clear();
  // @ts-expect-error Choosing a local file does not upload it.
  picker.upload();
  void [input, textarea, number, button, checkbox, select, date, badInput, badNumber, badSize, badSelect, controlled];
}
