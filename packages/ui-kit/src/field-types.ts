/** Bind this scope to a control to connect its label, help and error messages. */
export interface WlFieldSlotProps {
  /** Control ID; retained as an alias of inputId for existing consumers. */
  id: string;
  /** Bind to the control's id to associate the field label. */
  inputId: string;
  /** Bind to aria-labelledby for controls not named by label[for]. */
  labelId?: string;
  /** Bind to aria-describedby; includes both help and error IDs when present. */
  ariaDescribedby: string | undefined;
  /** Bind to aria-invalid; absent when no validation error is supplied. */
  ariaInvalid: true | undefined;
  /** Whether the field currently has a validation error. */
  invalid: boolean;
  /** Whether the control is required; forward to native controls as needed. */
  required: boolean;
}
