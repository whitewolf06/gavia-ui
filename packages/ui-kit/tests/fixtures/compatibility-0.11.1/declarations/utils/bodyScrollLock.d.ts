/**
 * Locks document scrolling without touching the DOM at module import time.
 * The reference counter keeps nested modal components from unlocking each other.
 */
export declare function lockBodyScroll(): () => void;
