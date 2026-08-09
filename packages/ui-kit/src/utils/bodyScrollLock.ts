let lockCount = 0;
let previousOverflow = "";

/**
 * Locks document scrolling without touching the DOM at module import time.
 * The reference counter keeps nested modal components from unlocking each other.
 */
export function lockBodyScroll(): () => void {
  if (typeof document === "undefined") return () => undefined;

  if (lockCount === 0) {
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
  lockCount += 1;

  let released = false;
  return () => {
    if (released || typeof document === "undefined") return;
    released = true;
    lockCount = Math.max(0, lockCount - 1);
    if (lockCount === 0) {
      document.body.style.overflow = previousOverflow;
      previousOverflow = "";
    }
  };
}
