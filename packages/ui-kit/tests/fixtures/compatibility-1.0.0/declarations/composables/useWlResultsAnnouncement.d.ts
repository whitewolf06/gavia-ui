/** Wait for a query to settle, and cancel stale announcements when a list closes. */
export declare function useWlResultsAnnouncement(options: {
    query: () => string;
    count: () => number;
    visible: () => boolean;
    loading?: () => boolean;
}): void;
