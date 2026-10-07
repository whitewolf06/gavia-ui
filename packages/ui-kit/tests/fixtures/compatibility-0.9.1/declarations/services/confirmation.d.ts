import { App, Ref } from 'vue';
export interface WlConfirmation {
    message: string;
    header: string;
    acceptLabel: string;
    rejectLabel: string;
    danger: boolean;
    group?: string;
    accept?: () => void;
    reject?: () => void;
}
export interface WlConfirmationStore {
    current: Ref<WlConfirmation | null>;
    require: (entry: WlConfirmation) => void;
    close: () => void;
}
export declare const WlConfirmationService: {
    install(app: App): void;
};
export declare function useConfirmationStore(): WlConfirmationStore;
