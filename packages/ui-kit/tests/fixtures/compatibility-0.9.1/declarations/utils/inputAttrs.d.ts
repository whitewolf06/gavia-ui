export declare function splitInputAttrs(attrs: Record<string, unknown>): {
    inputAttrs: Record<string, unknown>;
    rootAttrs: Record<string, unknown>;
};
/** Native attributes shared by controls whose focus target lives below their root. */
export interface WlControlProps {
    inputId?: string;
    name?: string;
    required?: boolean;
    readonly?: boolean;
    ariaLabel?: string;
    ariaLabelledby?: string;
}
export declare function getWlControlProps(inputAttrs: Record<string, unknown>): WlControlProps;
