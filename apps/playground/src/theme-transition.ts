interface ThemeViewTransition {
  readonly ready: Promise<void>;
  readonly updateCallbackDone: Promise<void>;
  readonly finished: Promise<void>;
  skipTransition(): void;
}
type ThemeTransitionDocument = Document & {
  startViewTransition?: (update: () => Promise<void>) => ThemeViewTransition;
};

/** One page snapshot transition, with no persistent per-element color animation. */
export function createPlaygroundThemeTransition() {
  let active: ThemeViewTransition | undefined;
  let cleanupFrame: number | undefined;
  let generation = 0;
  let disposed = false;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function stopForReducedMotion(): void {
    if (reducedMotion.matches) active?.skipTransition();
  }
  function cancel(): void {
    generation += 1;
    if (cleanupFrame !== undefined) window.cancelAnimationFrame(cleanupFrame);
    cleanupFrame = undefined;
    active?.skipTransition();
    active = undefined;
    reducedMotion.removeEventListener("change", stopForReducedMotion);
    delete document.documentElement.dataset.wlPlaygroundThemeTransition;
  }
  function run(update: () => Promise<void>): void {
    if (disposed) return;
    cancel();
    const request = generation;
    const root = document.documentElement;
    const transitionDocument = document as ThemeTransitionDocument;
    let updated = false;
    const apply = async () => {
      // skipTransition still invokes its callback; stale requests must not change state.
      if (disposed || request !== generation || updated) return;
      updated = true;
      await update();
    };
    const clear = () => {
      if (request !== generation) return;
      active = undefined;
      cleanupFrame = undefined;
      reducedMotion.removeEventListener("change", stopForReducedMotion);
      delete root.dataset.wlPlaygroundThemeTransition;
    };
    const reportUpdateFailure = (error: unknown) => {
      clear();
      console.error("Could not apply the playground theme.", error);
    };
    const applyWithoutSnapshot = () => {
      root.dataset.wlPlaygroundThemeTransition = "instant";
      // Establish transition:none before applying the new theme tokens.
      void root.offsetWidth;
      void apply().then(() => {
        if (disposed || request !== generation) return;
        // Commit the final styles while transitions remain suppressed, then release.
        void root.offsetWidth;
        cleanupFrame = window.requestAnimationFrame(clear);
      }, reportUpdateFailure);
    };
    if (!transitionDocument.startViewTransition || reducedMotion.matches || document.hidden) {
      applyWithoutSnapshot();
      return;
    }
    root.dataset.wlPlaygroundThemeTransition = "native";
    try {
      active = transitionDocument.startViewTransition(apply);
    } catch {
      applyWithoutSnapshot();
      return;
    }
    reducedMotion.addEventListener("change", stopForReducedMotion);
    // A skipped/unsupported animation rejects ready without rejecting the DOM update.
    void active.ready.catch(() => undefined);
    void active.updateCallbackDone.catch(reportUpdateFailure);
    void active.finished.then(clear, clear);
  }
  function dispose(): void {
    disposed = true;
    cancel();
  }
  return { run, cancel, dispose };
}
