import { App, Ref } from 'vue';
import { WlTone } from "../types.js";
export type WlToastSeverity = "success" | "info" | "warn" | "error";
export type WlToastPosition = "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right";
export interface WlToastAction {
    label: string;
    onClick: () => void;
}
export interface WlToastMessageOptions {
    /** Semantic tone; takes precedence over a legacy severity or helper name. */
    tone?: WlTone;
    detail?: string;
    /** Milliseconds; zero keeps the message until it is dismissed. */
    life?: number;
    action?: WlToastAction;
}
export interface WlToastMessage {
    id: number;
    /** @deprecated Use tone for new messages; retained as the legacy projection. */
    severity: WlToastSeverity;
    /** Optional on existing consumer messages; installed stores always resolve it. */
    tone?: WlTone;
    summary: string;
    detail?: string;
    group?: string;
    life?: number;
    action?: WlToastAction;
}
export type WlToastUpdate = Partial<Omit<WlToastMessage, "id" | "group">>;
export interface WlToastServiceOptions {
    life?: number;
    errorLife?: number;
}
export interface WlToastStore {
    messages: Ref<WlToastMessage[]>;
    add: (message: Omit<WlToastMessage, "id">, life?: number) => number;
    /** Promise settlement resets the lifetime even if its tone did not change. */
    update: (id: number, patch: WlToastUpdate, resetLife?: boolean) => void;
    remove: (id: number) => void;
    pause: (id: number, reason?: unknown) => void;
    resume: (id: number, reason?: unknown) => void;
    /** Remove only one group; omitted group clears the default group. */
    clear: (group?: string) => void;
}
/** Resolve existing consumer messages without requiring a new field. */
export declare function getWlToastTone(message: Pick<WlToastMessage, "tone" | "severity">): WlTone;
/** Keep the released severity field available to existing slots and adapters. */
export declare function getWlToastSeverity(tone: WlTone): WlToastSeverity;
/** Each Vue app receives its own queue. */
export declare const WlToastService: {
    install(app: App, options?: WlToastServiceOptions): void;
};
export declare function useToastStore(): WlToastStore;
