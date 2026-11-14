/** Two live regions, created lazily per Vue application. Toast messages own their own roles. */
export declare function useWlAnnouncer(): {
    announce: (message: string, priority?: "polite" | "assertive") => Promise<void>;
};
