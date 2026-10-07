export interface WlConfirmOptions {
    message: string;
    header?: string;
    acceptLabel?: string;
    rejectLabel?: string;
    accept?: () => void;
    reject?: () => void;
}
/** App-level confirmation helper; install WlConfirmationService and mount WlConfirmDialog once. */
export declare function useWlConfirm(): {
    confirm: (options: WlConfirmOptions) => void;
    confirmDanger: (options: WlConfirmOptions) => void;
    close: () => void;
};
