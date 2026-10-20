import { inject, type InjectionKey, onBeforeUnmount, onMounted, type Ref, watch } from "vue";

export interface PageAnchorRequest {
  /** Undefined means a single guarded scroll to the top. */
  id?: string;
  href: string;
  isCurrent: () => boolean;
  scope?: string;
}

/** One owner per App; no document-wide observation, timers or repeated frames. */
export function createPageAnchorRestorer() {
  let root: HTMLElement | null = null;
  let request: PageAnchorRequest | undefined;
  let frame: number | undefined;
  let observer: MutationObserver | undefined;
  let readiness: { release: () => void } | undefined;
  let settledFonts: Promise<FontFaceSet> | undefined;

  function releaseReadiness(): void {
    readiness?.release();
    readiness = undefined;
  }

  function cancel(): void {
    request = undefined;
    releaseReadiness();
    settledFonts = undefined;
    observer?.disconnect();
    if (frame !== undefined) window.cancelAnimationFrame(frame);
    frame = undefined;
    window.removeEventListener("hashchange", onLocationChange);
    window.removeEventListener("popstate", onLocationChange);
  }

  function isCurrent(): boolean {
    if (!request) return false;
    if (window.location.href === request.href && request.isCurrent()) return true;
    cancel();
    return false;
  }

  function onLocationChange(): void {
    // Cancellation only; App remains the owner of history navigation requests.
    isCurrent();
  }

  function findTarget(pending: PageAnchorRequest): HTMLElement | undefined {
    const scope = pending.scope
      ? root?.matches(pending.scope) ? root : root?.querySelector<HTMLElement>(pending.scope)
      : root;
    const globalTarget = pending.id === undefined ? null : scope?.ownerDocument.getElementById(pending.id);
    const target = scope?.id === pending.id
      ? scope
      : globalTarget && scope?.contains(globalTarget)
        ? globalTarget
        : Array.from(scope?.querySelectorAll<HTMLElement>("[id]") ?? [])
            .find((element) => element.id === pending.id);
    return target && scope?.contains(target) && target.getClientRects().length ? target : undefined;
  }

  function waitForReadiness(pending: PageAnchorRequest): boolean {
    if (document.readyState === "complete"
      && (document.fonts?.status !== "loading" || document.fonts.ready === settledFonts)) return false;
    let shown = document.readyState === "complete";
    let waitingFonts = false;
    const gate = {
      release: () => {
        window.removeEventListener("load", onReady);
        window.removeEventListener("pageshow", onReady);
      }
    };
    const current = () => readiness === gate && request === pending && isCurrent();
    const onReady = (event?: Event) => {
      if (!current()) return;
      if (event?.type === "pageshow") shown = true;
      if (!shown || document.readyState !== "complete" || waitingFonts) return;
      gate.release();
      // The target's current layout may discover fonts after the initial load.
      if (!findTarget(pending)) {
        releaseReadiness();
        schedule();
        return;
      }
      waitingFonts = true;
      const fonts = document.fonts?.ready;
      void Promise.resolve(fonts).then(() => {
        if (!current()) return;
        settledFonts = fonts;
        releaseReadiness();
        schedule();
      }, () => {
        if (current()) cancel();
      });
    };
    readiness = gate;
    if (!shown) {
      window.addEventListener("load", onReady);
      window.addEventListener("pageshow", onReady);
    }
    onReady();
    return true;
  }

  function schedule(): void {
    if (!isCurrent() || readiness || frame !== undefined) return;
    frame = window.requestAnimationFrame(() => {
      frame = undefined;
      if (!isCurrent()) return;
      const pending = request!;
      if (pending.id === undefined) {
        cancel();
        window.scrollTo({ top: 0, behavior: "instant" });
        return;
      }
      const target = findTarget(pending);
      if (!target || waitForReadiness(pending)) return;
      cancel();
      target.scrollIntoView({ block: "start", behavior: "instant" });
    });
  }

  function observeRoot(): void {
    observer?.disconnect();
    if (!isCurrent()) return;
    if (root && request?.id !== undefined && typeof MutationObserver !== "undefined") {
      observer ??= new MutationObserver(schedule);
      observer.observe(root, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["id", "hidden", "style", "class", "aria-hidden", "inert", "open"]
      });
    }
    schedule();
  }

  return {
    restore(next: PageAnchorRequest): void {
      cancel();
      if (next.id === "") return;
      request = next;
      window.addEventListener("hashchange", onLocationChange);
      window.addEventListener("popstate", onLocationChange);
      observeRoot();
    },
    attach(next: HTMLElement): void {
      if (root !== next) releaseReadiness();
      root = next;
      observeRoot();
    },
    detach(previous: HTMLElement): void {
      // A late unmount from the previous page cannot detach its successor.
      if (root !== previous) return;
      root = null;
      releaseReadiness();
      if (frame !== undefined) window.cancelAnimationFrame(frame);
      frame = undefined;
      observer?.disconnect();
    },
    cancel
  };
}

export const pageAnchorRestorerKey: InjectionKey<ReturnType<typeof createPageAnchorRestorer>> = Symbol("playground-page-anchor");

/** Register with App's sole owner; retain initial restoration for standalone pages. */
export function usePageAnchor(element: Ref<HTMLElement | null>): void {
  const inherited = inject(pageAnchorRestorerKey, undefined);
  const restorer = inherited ?? createPageAnchorRestorer();
  let mounted = false;
  let attached: HTMLElement | null = null;

  function publishRoot(): void {
    if (!mounted || attached === element.value) return;
    if (attached) restorer.detach(attached);
    attached = element.value;
    if (attached) restorer.attach(attached);
  }

  watch(element, publishRoot, { flush: "post" });
  onMounted(() => {
    mounted = true;
    publishRoot();
    if (inherited || !window.location.hash) return;
    let id: string;
    try {
      id = decodeURIComponent(window.location.hash.slice(1));
    } catch {
      return;
    }
    restorer.restore({ id, href: window.location.href, isCurrent: () => mounted });
  });
  onBeforeUnmount(() => {
    mounted = false;
    if (attached) restorer.detach(attached);
    attached = null;
    if (!inherited) restorer.cancel();
  });
}
