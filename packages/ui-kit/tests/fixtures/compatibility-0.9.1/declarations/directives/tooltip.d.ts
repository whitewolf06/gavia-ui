import { Directive } from 'vue';
type TooltipValue = string | {
    value: string;
    showDelay?: number;
    hideDelay?: number;
    motion?: boolean;
    pt?: Record<string, unknown>;
};
export declare const WlTooltip: Directive<HTMLElement, TooltipValue>;
export {};
