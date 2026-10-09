export interface WlConfirmOptions {
    message: string;
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
    confirmDanger: (options: WlConfirmOptions) => void;
    /** Existing close remains global and safe to use directly as a DOM event handler. */
    close: () => void;
    closeGroup: (group: string | undefined) => void;
}
/** App-level confirmation helper; install WlConfirmationService and mount WlConfirmDialog once. */
export declare function useWlConfirm(): WlConfirmApi;
