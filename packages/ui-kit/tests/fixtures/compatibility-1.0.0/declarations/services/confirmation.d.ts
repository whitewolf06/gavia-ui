import { App, Ref } from 'vue';
import { WlTone } from "../types.js";
export interface WlConfirmation {
    message: string;
    header: string;
    acceptLabel: string;
    rejectLabel: string;
    /** Semantic appearance; takes precedence over the legacy danger flag. */
    tone?: WlTone;
    /** Legacy destructive appearance when tone is omitted. */
    danger: boolean;
    group?: string;
    accept?: () => void;
    reject?: () => void;
}
export interface WlConfirmationStore {
    current: Ref<WlConfirmation | null>;
    require: (entry: WlConfirmation) => void;
    request: (entry: WlConfirmation) => Promise<boolean>;
    accept: () => void;
    reject: () => void;
    cancel: (entry: WlConfirmation) => void;
    /** Close the active confirmation regardless of its group. */
    close: () => void;
    /** Close only the matching group; undefined selects the default group. */
    closeGroup: (group: string | undefined) => void;
}
export declare const WlConfirmationService: {
    install(app: App): void;
};
export declare function useConfirmationStore(): WlConfirmationStore;
