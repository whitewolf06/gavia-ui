import { WlTone } from "../types.js";
export interface WlConfirmOptions {
    message: string;
    /** Semantic appearance of the confirmation action; defaults to accent. */
    tone?: WlTone;
    /** Mount a WlConfirmDialog with the same group to display this request. */
    group?: string;
    header?: string;
    acceptLabel?: string;
    rejectLabel?: string;
    accept?: () => void;
    reject?: () => void;
}
export interface WlConfirmApi {
    confirm: (options: WlConfirmOptions) => void;
    /** Legacy danger alias; an explicit options.tone takes precedence. */
    confirmDanger: (options: WlConfirmOptions) => void;
    /** Existing close remains global and safe to use directly as a DOM event handler. */
    close: () => void;
    closeGroup: (group: string | undefined) => void;
}
/** Promise-returning installed helper, also assignable to the released callback API. */
export interface WlConfirmController extends WlConfirmApi {
    confirm: (options: WlConfirmOptions) => Promise<boolean>;
    /** Legacy danger alias; an explicit options.tone takes precedence. */
    confirmDanger: (options: WlConfirmOptions) => Promise<boolean>;
}
/** App-level confirmation helper; install WlConfirmationService and mount WlConfirmDialog once. */
export declare function useWlConfirm(): WlConfirmController;
