import { describe, expect, it, vi } from "vitest";
import { lockBodyScroll } from "../src/utils/bodyScrollLock";

describe("body scroll lock", () => {
  it("keeps the gutter until the last lock is released and restores inline styles", () => {
    const root = document.documentElement;
    const body = document.body;
    const originalRootStyle = root.getAttribute("style");
    const originalBodyStyle = body.getAttribute("style");
    body.style.setProperty("overflow", "auto", "important");
    body.style.setProperty("padding-right", "12px", "important");
    root.style.setProperty("scrollbar-gutter", "auto", "important");
    vi.spyOn(root, "clientWidth", "get").mockImplementation(
      () => window.innerWidth - (body.style.overflow === "hidden" ? 0 : 10)
    );
    vi.spyOn(body, "getBoundingClientRect").mockImplementation(
      () => ({ width: window.innerWidth - (body.style.overflow === "hidden" ? 0 : 10) }) as DOMRect
    );

    let releaseFirst: (() => void) | undefined;
    let releaseSecond: (() => void) | undefined;
    try {
      releaseFirst = lockBodyScroll();
      releaseSecond = lockBodyScroll();
      expect(body.style.overflow).toBe("hidden");
      expect(body.style.paddingRight).toContain("22px");
      expect(root.style.scrollbarGutter).toBe("stable");

      releaseFirst();
      expect(body.style.overflow).toBe("hidden");
      releaseSecond();
      releaseSecond();
      expect(body.style.getPropertyValue("overflow")).toBe("auto");
      expect(body.style.getPropertyPriority("overflow")).toBe("important");
      expect(body.style.getPropertyValue("padding-right")).toBe("12px");
      expect(body.style.getPropertyPriority("padding-right")).toBe("important");
      expect(root.style.getPropertyValue("scrollbar-gutter")).toBe("auto");
      expect(root.style.getPropertyPriority("scrollbar-gutter")).toBe("important");
    } finally {
      releaseFirst?.();
      releaseSecond?.();
      if (originalRootStyle === null) root.removeAttribute("style");
      else root.setAttribute("style", originalRootStyle);
      if (originalBodyStyle === null) body.removeAttribute("style");
      else body.setAttribute("style", originalBodyStyle);
      vi.restoreAllMocks();
    }
  });

  it("does not compensate twice when the gutter already keeps body width stable", () => {
    const root = document.documentElement;
    const body = document.body;
    const originalRootStyle = root.getAttribute("style");
    const originalBodyStyle = body.getAttribute("style");
    body.style.paddingRight = "12px";
    vi.spyOn(root, "clientWidth", "get").mockImplementation(
      () => window.innerWidth - (body.style.overflow === "hidden" ? 0 : 10)
    );
    vi.spyOn(body, "getBoundingClientRect").mockReturnValue(
      { width: window.innerWidth - 10 } as DOMRect
    );

    let release: (() => void) | undefined;
    try {
      release = lockBodyScroll();
      expect(root.style.scrollbarGutter).toBe("stable");
      expect(body.style.overflow).toBe("hidden");
      expect(body.style.paddingRight).toBe("12px");
      release();
      expect(body.style.overflow).toBe("");
      expect(body.style.paddingRight).toBe("12px");
    } finally {
      release?.();
      if (originalRootStyle === null) root.removeAttribute("style");
      else root.setAttribute("style", originalRootStyle);
      if (originalBodyStyle === null) body.removeAttribute("style");
      else body.setAttribute("style", originalBodyStyle);
      vi.restoreAllMocks();
    }
  });

  it("does not reserve space when the page has no scrollbar", () => {
    const root = document.documentElement;
    const body = document.body;
    const originalRootStyle = root.getAttribute("style");
    const originalBodyStyle = body.getAttribute("style");
    vi.spyOn(root, "clientWidth", "get").mockReturnValue(window.innerWidth);
    let release: (() => void) | undefined;
    try {
      release = lockBodyScroll();
      expect(body.style.overflow).toBe("hidden");
      expect(body.style.paddingRight).toBe("");
      expect(root.style.scrollbarGutter).toBe("");
      release();
      expect(body.style.overflow).toBe("");
    } finally {
      release?.();
      if (originalRootStyle === null) root.removeAttribute("style");
      else root.setAttribute("style", originalRootStyle);
      if (originalBodyStyle === null) body.removeAttribute("style");
      else body.setAttribute("style", originalBodyStyle);
      vi.restoreAllMocks();
    }
  });
});
