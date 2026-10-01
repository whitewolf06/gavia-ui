const previousAttrs = new WeakMap<Element, { ariaHidden: string | null; inert: boolean }>();

/** A leaving panel remains visible for animation but no longer exposes controls. */
export function markOverlayLeaving(element: Element): void {
  if (!previousAttrs.has(element)) {
    previousAttrs.set(element, {
      ariaHidden: element.getAttribute("aria-hidden"),
      inert: element.hasAttribute("inert")
    });
  }
  element.setAttribute("aria-hidden", "true");
  element.setAttribute("inert", "");
}

/** Restore consumer attributes if a closing transition is interrupted by reopening. */
export function restoreOverlayEntering(element: Element): void {
  const previous = previousAttrs.get(element);
  if (!previous) return;
  if (previous.ariaHidden === null) element.removeAttribute("aria-hidden");
  else element.setAttribute("aria-hidden", previous.ariaHidden);
  if (!previous.inert) element.removeAttribute("inert");
  previousAttrs.delete(element);
}
