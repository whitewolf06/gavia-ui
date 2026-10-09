import { App, Ref } from 'vue';
export type WlToastSeverity = "success" | "info" | "warn" | "error";
export interface WlToastMessage {
    id: number;
    severity: WlToastSeverity;
    summary: string;
    detail?: string;
    group?: string;
}
export interface WlToastStore {
    messages: Ref<WlToastMessage[]>;
    add: (message: Omit<WlToastMessage, "id">, life?: number) => void;
    remove: (id: number) => void;
    /** Remove only one group; omitted group clears the default group. */
    clear: (group?: string) => void;
}
/** Each Vue app receives its own queue. */
export declare const WlToastService: {
    install(app: App): void;
};
export declare function useToastStore(): WlToastStore;
