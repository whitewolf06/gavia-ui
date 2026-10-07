import { onBeforeUnmount, onMounted, readonly, shallowRef, watch, type Ref } from "vue";

export interface DocumentationScrollspyHeading {
  id: string;
  title: string;
}
export interface DocumentationHeadingRect {
  id: string;
  /** Viewport top, in the same coordinates as the sticky-header offset. */
  top: number;
}
export interface DocumentationScrollspyOptions {
  /** The content column only; navigation headings must not be observed. */
  root: Ref<HTMLElement | null>;
  key: () => unknown;
  /** Filter visible h2 elements without replacing their DOM order or title. */
  headingIds?: () => readonly string[] | undefined;
}

/** Keep the preceding section active through long content between headings. */
export function choosingActiveHeading(
  rects: readonly DocumentationHeadingRect[],
  offset: number,
  atBottom: boolean
): string | null {
  const valid = rects.filter((heading) => heading.id.length > 0 && Number.isFinite(heading.top));
  if (!valid.length) return null;
  if (atBottom) return valid[valid.length - 1]!.id;
  const threshold = Number.isFinite(offset) ? Math.max(0, offset) : 0;
  let active = valid[0]!.id;
  // DOM order also defines the result when multiple headings share a row.
  for (const heading of valid) {
    if (heading.top <= threshold) active = heading.id;
  }
  return active;
}

/** Match the native anchor's scroll-margin and whole-pixel scroll position. */
export function headingActivationTop(top: number, scrollMarginTop: string): number {
  const parsed = Number.parseFloat(scrollMarginTop);
  return Math.floor(top - (Number.isFinite(parsed) ? parsed : 0));
}

function isVisibleHeading(element: HTMLElement, view: Window): boolean {
  if (!element.getClientRects().length) return false;
  for (let ancestor: HTMLElement | null = element; ancestor; ancestor = ancestor.parentElement) {
    if (ancestor.hidden || ancestor.hasAttribute("inert") || ancestor.getAttribute("aria-hidden") === "true") return false;
    const style = view.getComputedStyle(ancestor);
    if (style.display === "none" || style.visibility === "hidden" || style.visibility === "collapse" || style.contentVisibility === "hidden") return false;
  }
  return true;
}

/** Observe documentation geometry without changing the URL or scroll position. */
export function useDocumentationScrollspy(options: DocumentationScrollspyOptions) {
  const activeId = shallowRef<string | null>(null);
  const headings = shallowRef<readonly DocumentationScrollspyHeading[]>([]);
  let mounted = false;
  let view: Window | undefined;
  let doc: Document | undefined;
  let frame: number | undefined;
  let rootObserver: MutationObserver | undefined;
  let documentObserver: MutationObserver | undefined;
  let resizeObserver: ResizeObserver | undefined;

  function setHeadings(next: readonly DocumentationScrollspyHeading[]): void {
    if (next.length !== headings.value.length || next.some((heading, index) =>
      heading.id !== headings.value[index]?.id || heading.title !== headings.value[index]?.title
    )) headings.value = next;
  }

  function update(): void {
    const root = options.root.value;
    if (!mounted || !view || !doc || !root?.isConnected) {
      setHeadings([]);
      activeId.value = null;
      return;
    }
    const allowedIds = options.headingIds?.();
    const allowed = allowedIds === undefined ? undefined : new Set(allowedIds);
    const seen = new Set<string>();
    const elements = Array.from(root.querySelectorAll<HTMLElement>("h2[id]")).filter((heading) => {
      if (!heading.id || seen.has(heading.id) || (allowed && !allowed.has(heading.id)) || !isVisibleHeading(heading, view!)) return false;
      seen.add(heading.id);
      return true;
    });
    setHeadings(elements.map((heading) => ({
      id: heading.id,
      title: heading.textContent?.trim().replace(/\s+/g, " ") || heading.getAttribute("aria-label") || heading.id
    })));
    const viewportHeight = doc.documentElement.clientHeight || view.innerHeight;
    const scrollPadding = view.getComputedStyle(doc.documentElement).scrollPaddingTop.trim();
    const parsedPadding = Number.parseFloat(scrollPadding);
    const offset = scrollPadding.endsWith("%") ? parsedPadding * viewportHeight / 100 : parsedPadding;
    const scrollingElement = doc.scrollingElement ?? doc.documentElement;
    const scrollHeight = Math.max(scrollingElement.scrollHeight, doc.documentElement.scrollHeight, doc.body?.scrollHeight ?? 0);
    const maximumScroll = Math.max(0, scrollHeight - viewportHeight);
    const scrollTop = Math.max(scrollingElement.scrollTop, view.scrollY);
    // A short, unscrolled document must not start with its last heading active.
    const atBottom = maximumScroll > 0 && scrollTop > 0 && scrollTop >= maximumScroll - 2;
    // Match native anchor alignment: scroll-margin supplements root scroll-padding.
    // Browser scroll positions can round to whole CSS pixels.
    activeId.value = choosingActiveHeading(elements.map((heading) => ({
      id: heading.id, top: headingActivationTop(heading.getBoundingClientRect().top, view!.getComputedStyle(heading).scrollMarginTop)
    })), offset, atBottom);
  }

  function schedule(): void {
    if (!mounted || !view || frame !== undefined) return;
    frame = view.requestAnimationFrame(() => { frame = undefined; update(); });
  }

  function observeRoot(): void {
    rootObserver?.disconnect();
    resizeObserver?.disconnect();
    const root = options.root.value;
    if (root) {
      rootObserver?.observe(root, {
        childList: true, subtree: true, characterData: true,
        attributes: true, attributeFilter: ["id", "style", "class", "hidden", "aria-hidden", "inert", "open"]
      });
      // A containing tab or page can hide content without mutating the headings themselves.
      for (let ancestor = root.parentElement; ancestor; ancestor = ancestor.parentElement) {
        rootObserver?.observe(ancestor, {
          attributes: true, attributeFilter: ["style", "class", "hidden", "aria-hidden", "inert", "open"]
        });
      }
      resizeObserver?.observe(root);
    }
    if (doc) resizeObserver?.observe(doc.documentElement);
    schedule();
  }

  watch(options.root, () => { if (mounted) observeRoot(); }, { flush: "post" });
  watch(options.key, () => {
    setHeadings([]);
    activeId.value = null;
    schedule();
  }, { deep: true, flush: "post" });
  watch(() => options.headingIds?.(), schedule, { deep: true, flush: "post" });

  onMounted(() => {
    if (typeof window === "undefined" || typeof document === "undefined") return;
    mounted = true;
    doc = options.root.value?.ownerDocument ?? document;
    view = doc.defaultView ?? window;
    if (typeof MutationObserver !== "undefined") {
      rootObserver = new MutationObserver(schedule);
      documentObserver = new MutationObserver(schedule);
      documentObserver.observe(doc.documentElement, { attributes: true, attributeFilter: ["style", "class", "data-wl-theme"] });
    }
    if (typeof ResizeObserver !== "undefined") resizeObserver = new ResizeObserver(schedule);
    // Capture nested scrolling too; each event still produces at most one update per frame.
    doc.addEventListener("scroll", schedule, { capture: true, passive: true });
    view.addEventListener("resize", schedule, { passive: true });
    view.addEventListener("hashchange", schedule);
    observeRoot();
  });

  onBeforeUnmount(() => {
    mounted = false;
    rootObserver?.disconnect();
    documentObserver?.disconnect();
    resizeObserver?.disconnect();
    if (frame !== undefined) view?.cancelAnimationFrame(frame);
    frame = undefined;
    doc?.removeEventListener("scroll", schedule, true);
    view?.removeEventListener("resize", schedule);
    view?.removeEventListener("hashchange", schedule);
    view = undefined;
    doc = undefined;
  });

  return { activeId: readonly(activeId), headings: readonly(headings) };
}
