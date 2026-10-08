import type { AnchorHTMLAttributes, ButtonHTMLAttributes, HTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes } from "vue";

/** Data attributes stay open without accepting arbitrary props or untyped listeners. */
export interface WlDataAttributes {
  [name: `data-${string}`]: string | number | boolean | null | undefined;
  /** Vue template tooling checks static data-test as dataTest on component props. */
  [name: `data${Capitalize<string>}`]: string | number | boolean | null | undefined;
}
export type WlElementAttributes = HTMLAttributes & WlDataAttributes;

/** Attributes actually routed to the native control by splitInputAttrs. */
type NativeControlKey = "name" | "form" | "autocomplete" | "autofocus" | "required" | "readonly"
  | "maxlength" | "minlength" | "min" | "max" | "step" | "pattern" | "list" | "multiple"
  | "accept" | "capture" | "dirname" | "inputmode" | "enterkeyhint" | "autocapitalize"
  | "spellcheck" | "rows" | "cols" | "wrap";
type NativeControlAttributes<Attributes> = WlElementAttributes & Pick<Attributes, Extract<keyof Attributes, NativeControlKey>>;

/** Value, checked, size and control type remain owned by the component contract. */
export type WlInputAttributes = NativeControlAttributes<InputHTMLAttributes>;
export type WlTextareaAttributes = NativeControlAttributes<TextareaHTMLAttributes>;
export type WlPasswordInputAttributes = Omit<WlInputAttributes, "multiple" | "accept" | "capture">;
export type WlNumberInputAttributes = Omit<WlPasswordInputAttributes, "pattern" | "maxlength" | "minlength">;
export type WlSliderAttributes = Omit<WlNumberInputAttributes, "readonly">;
export type WlToggleAttributes = Omit<WlInputAttributes, "multiple" | "accept" | "capture" | "placeholder" | "readonly" | "min" | "max" | "step" | "pattern" | "maxlength" | "minlength" | "list">;
export type WlTimeInputAttributes = Omit<WlPasswordInputAttributes, "maxlength" | "minlength" | "pattern" | "step">;
export type WlFileInputAttributes = Omit<WlInputAttributes, "readonly" | "placeholder" | "maxlength" | "minlength" | "min" | "max" | "step" | "pattern" | "list" | "autocomplete" | "autofocus">;
export type WlDateInputAttributes = Omit<WlPasswordInputAttributes, "min" | "max" | "step" | "autocomplete">;
export type WlButtonAttributes = ButtonHTMLAttributes & WlDataAttributes;
export type WlLinkAttributes = AnchorHTMLAttributes & WlDataAttributes;

/** A proxy combobox exposes DOM attrs and its existing name serialization, not native text validation. */
export type WlComboboxAttributes = WlElementAttributes & { name?: string };
