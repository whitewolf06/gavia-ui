/** Browser selection only. The consumer owns the chosen files and upload policy. */
export declare function useNativeFilePicker(disabled: () => boolean, select: (files: File[]) => void, cancel?: () => void): {
    input: import('vue').Ref<HTMLInputElement | null>;
    choose: () => void;
    clear: () => void;
    onChange: (event: Event) => void;
    onCancel: () => void;
};
