/** Permission failures and unavailable clipboard APIs resolve false, including SSR. */
export declare function useWlClipboard(options?: {
    resetAfter?: number;
}): {
    copied: Readonly<import('vue').Ref<boolean>>;
    copy: (text: string) => Promise<boolean>;
};
