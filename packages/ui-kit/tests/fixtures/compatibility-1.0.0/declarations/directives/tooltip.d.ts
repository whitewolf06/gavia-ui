import { Directive } from 'vue';
import { WlPt } from "../pt-types.js";
export type WlTooltipValue = string | {
    value: string;
    showDelay?: number;
    hideDelay?: number;
    motion?: boolean;
    pt?: WlPt<"tooltip">;
};
export declare const WlTooltipDirective: Directive<HTMLElement, WlTooltipValue>;
