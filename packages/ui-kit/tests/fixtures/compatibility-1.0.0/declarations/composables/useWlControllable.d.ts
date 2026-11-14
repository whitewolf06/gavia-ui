import { WritableComputedRef } from 'vue';
/** Undefined means uncontrolled; the first default is captured once per instance. */
export declare function useWlControllable<T>(options: {
    value: () => T | undefined;
    defaultValue: T;
    onChange?: (value: T) => void;
}): WritableComputedRef<T>;
export declare function useWlDisclosure(options?: {
    value?: () => boolean | undefined;
    defaultValue?: boolean;
    onChange?: (value: boolean) => void;
}): {
    isOpen: WritableComputedRef<boolean>;
    open: () => void;
    close: () => void;
    toggle: () => void;
};
