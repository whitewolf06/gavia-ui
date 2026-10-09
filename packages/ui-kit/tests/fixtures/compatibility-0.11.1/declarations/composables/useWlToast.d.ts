export interface WlToastOptions {
    /** Mount a WlToast with the same group to display these messages. */
    group?: string;
}
export interface WlToastApi {
    ok: (message: string, detail?: string) => void;
    info: (message: string, detail?: string) => void;
    warn: (message: string, detail?: string) => void;
    err: (message: string, detail?: string) => void;
    /** Clear this helper's group without removing another group's messages. */
    clear: () => void;
}
/** App-level toast helper; install WlToastService and mount WlToast once per displayed group. */
export declare function useWlToast(options?: WlToastOptions): WlToastApi;
