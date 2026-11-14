import { WlToastMessageOptions, WlToastUpdate } from "../services/toast.js";
export interface WlToastOptions {
    /** Mount a WlToast with the same group to display these messages. */
    group?: string;
}
export interface WlToastPush {
    (summary: string, options?: WlToastMessageOptions): number;
    /** Existing detail strings remain supported. */
    (summary: string, detail?: string): number;
}
export type WlToastContent = string | (WlToastMessageOptions & {
    summary: string;
});
export interface WlToastPromiseOptions<T> {
    loading: WlToastContent;
    success: WlToastContent | ((value: T) => WlToastContent);
    error: WlToastContent | ((error: unknown) => WlToastContent);
}
export interface WlToastApi {
    ok: (message: string, detail?: string) => void;
    info: (message: string, detail?: string) => void;
    warn: (message: string, detail?: string) => void;
    err: (message: string, detail?: string) => void;
    /** Clear this helper's group without removing another group's messages. */
    clear: () => void;
}
/** The installed helper's richer API; legacy WlToastApi implementations remain valid. */
export interface WlToastController extends WlToastApi {
    /** Show a message using its semantic tone; defaults to info. */
    show: WlToastPush;
    success: WlToastPush;
    info: WlToastPush;
    warning: WlToastPush;
    error: WlToastPush;
    /** Alias for success, preserving the existing API. */
    ok: WlToastPush;
    /** Alias for warning, preserving the existing API. */
    warn: WlToastPush;
    /** Alias for error, preserving the existing API. */
    err: WlToastPush;
    update: (id: number, patch: WlToastUpdate) => void;
    dismiss: (id: number) => void;
    promise: <T>(promise: Promise<T>, options: WlToastPromiseOptions<T>) => Promise<T>;
    /** Clear this helper's group without removing another group's messages. */
    clear: () => void;
}
/** App-level toast helper; install WlToastService and mount WlToast once per displayed group. */
export declare function useWlToast(options?: WlToastOptions): WlToastController;
