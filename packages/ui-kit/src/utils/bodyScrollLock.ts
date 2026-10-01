let lockCount = 0;
interface InlineStyle {
  value: string;
  priority: string;
}

function readInlineStyle(style: CSSStyleDeclaration, property: string): InlineStyle {
  return { value: style.getPropertyValue(property), priority: style.getPropertyPriority(property) };
}

function restoreInlineStyle(style: CSSStyleDeclaration, property: string, previous: InlineStyle): void {
  if (previous.value) style.setProperty(property, previous.value, previous.priority);
  else style.removeProperty(property);
}

let previousOverflow: InlineStyle | undefined;
let previousScrollbarGutter: InlineStyle | undefined;
let reservedScrollbarGutter = false;
let previousPaddingRight: InlineStyle | undefined;
let compensatedScrollbar = false;

/**
 * Locks document scrolling without touching the DOM at module import time.
 * The reference counter keeps nested modal components from unlocking each other.
 */
export function lockBodyScroll(): () => void {
  if (typeof document === "undefined") return () => undefined;

  if (lockCount === 0) {
    const root = document.documentElement;
    const body = document.body;
    const bodyWidth = body.getBoundingClientRect().width;
    const hasScrollbar = window.innerWidth > root.clientWidth;
    const currentGutter = getComputedStyle(root).getPropertyValue("scrollbar-gutter");
    reservedScrollbarGutter = hasScrollbar && !currentGutter.includes("stable");
    if (reservedScrollbarGutter) {
      previousScrollbarGutter = readInlineStyle(root.style, "scrollbar-gutter");
      root.style.setProperty("scrollbar-gutter", "stable", "important");
    }
    const bodyPaddingRight = getComputedStyle(body).paddingRight;
    previousOverflow = readInlineStyle(body.style, "overflow");
    body.style.setProperty("overflow", "hidden", "important");
    // clientWidth can grow even when scrollbar-gutter has kept the body at its original width.
    const lostGutter = body.getBoundingClientRect().width - bodyWidth;
    compensatedScrollbar = lostGutter > 0;
    if (compensatedScrollbar) {
      // Some browsers do not reserve the root gutter while body overflow is hidden.
      previousPaddingRight = readInlineStyle(body.style, "padding-right");
      body.style.setProperty("padding-right", `calc(${bodyPaddingRight} + ${lostGutter}px)`, "important");
    }
  }
  lockCount += 1;

  let released = false;
  return () => {
    if (released || typeof document === "undefined") return;
    released = true;
    lockCount = Math.max(0, lockCount - 1);
    if (lockCount === 0) {
      if (previousOverflow) restoreInlineStyle(document.body.style, "overflow", previousOverflow);
      if (compensatedScrollbar && previousPaddingRight) {
        restoreInlineStyle(document.body.style, "padding-right", previousPaddingRight);
      }
      if (reservedScrollbarGutter && previousScrollbarGutter) {
        restoreInlineStyle(document.documentElement.style, "scrollbar-gutter", previousScrollbarGutter);
      }
      previousOverflow = undefined;
      previousPaddingRight = undefined;
      previousScrollbarGutter = undefined;
      compensatedScrollbar = false;
      reservedScrollbarGutter = false;
    }
  };
}
