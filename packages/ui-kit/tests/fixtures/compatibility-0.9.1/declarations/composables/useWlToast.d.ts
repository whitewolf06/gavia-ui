/** App-level toast helper; install WlToastService and mount WlToast once. */
export declare function useWlToast(): {
    ok: (message: string, detail?: string) => void;
    info: (message: string, detail?: string) => void;
    warn: (message: string, detail?: string) => void;
    err: (message: string, detail?: string) => void;
};
