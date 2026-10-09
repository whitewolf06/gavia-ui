/** Bind this scope to a control to connect its label, help and error messages. */
export interface WlFieldSlotProps {
    id: string;
    inputId: string;
    ariaDescribedby: string | undefined;
    ariaInvalid: true | undefined;
    invalid: boolean;
    required: boolean;
}
