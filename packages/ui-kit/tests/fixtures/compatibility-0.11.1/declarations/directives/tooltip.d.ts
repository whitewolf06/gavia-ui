import { WlPt } from '../pt-types';
import { Directive } from 'vue';
export type WlTooltipValue = string | {
    value: string;
    showDelay?: number;
    hideDelay?: number;
    motion?: boolean;
    pt?: WlPt<"tooltip">;
};
export declare const WlTooltip: Directive<HTMLElement, WlTooltipValue>;
