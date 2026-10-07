// @vitest-environment node
import { describe, expect, it } from "vitest";
import { headingActivationTop, choosingActiveHeading, type DocumentationHeadingRect } from "../../../apps/playground/src/documentation/useDocumentationScrollspy";

describe("documentation scrollspy heading choice", () => {
  it("imports safely on the server and leaves an empty or unavailable section inactive", () => {
    expect(typeof window).toBe("undefined");
    expect(typeof document).toBe("undefined");
    expect(choosingActiveHeading([], 80, false)).toBeNull();
    expect(choosingActiveHeading([], 80, true)).toBeNull();
  });

  it("starts at the first visible heading before any heading reaches the sticky header", () => {
    expect(choosingActiveHeading([
      { id: "installation", top: 160 }, { id: "examples", top: 480 }
    ], 80, false)).toBe("installation");
  });

  it.each([
    { nextTop: 80, expected: "examples" },
    { nextTop: 80.5, expected: "installation" },
    { nextTop: 79.5, expected: "examples" }
  ])("uses the actual sticky threshold when the next heading is at $nextTop", ({ nextTop, expected }) => {
    expect(choosingActiveHeading([
      { id: "installation", top: -240 }, { id: "examples", top: nextTop }, { id: "api", top: 900 }
    ], 80, false)).toBe(expected);
  });

  it("keeps the preceding section active through a long example before the next heading", () => {
    expect(choosingActiveHeading([
      { id: "rules", top: -900 }, { id: "grid", top: -460 }, { id: "next", top: 620 }
    ], 96, false)).toBe("grid");
  });

  it("adapts to a taller responsive header without requiring a hash change", () => {
    const rects = [{ id: "rules", top: -20 }, { id: "examples", top: 92 }, { id: "next", top: 360 }];
    expect(choosingActiveHeading(rects, 80, false)).toBe("rules");
    expect(choosingActiveHeading(rects, 112, false)).toBe("examples");
  });

  it("marks the final short section only when the caller has reached the document bottom", () => {
    const rects = [{ id: "examples", top: -320 }, { id: "continue", top: 240 }];
    expect(choosingActiveHeading(rects, 80, false)).toBe("examples");
    expect(choosingActiveHeading(rects, 80, true)).toBe("continue");
  });

  it("preserves the DOM order of visible headings that share a row", () => {
    expect(choosingActiveHeading([
      { id: "settings", top: 40 }, { id: "preview", top: 40 }, { id: "code", top: 300 }
    ], 80, false)).toBe("preview");
  });

  it("does not activate unavailable geometry and treats auto or invalid padding as zero", () => {
    const rects = [
      { id: "hidden", top: Number.NaN }, { id: "rules", top: -30 },
      { id: "examples", top: 20 }, { id: "removed", top: Number.POSITIVE_INFINITY }
    ];
    expect(choosingActiveHeading(rects, Number.NaN, false)).toBe("rules");
    expect(choosingActiveHeading(rects, 80, true)).toBe("examples");
    expect(choosingActiveHeading([{ id: "hidden", top: Number.NaN }], 80, false)).toBeNull();
  });

  it("does not reorder or mutate the caller's geometry snapshot", () => {
    const rects: readonly DocumentationHeadingRect[] = Object.freeze([
      Object.freeze({ id: "first", top: -100 }), Object.freeze({ id: "second", top: 60 })
    ]);
    expect(choosingActiveHeading(rects, 80, false)).toBe("second");
    expect(rects).toEqual([{ id: "first", top: -100 }, { id: "second", top: 60 }]);
  });
  it.each([
    { top: 97.39, margin: "16px", expected: 81 },
    { top: 81.39, margin: "0px", expected: 81 },
    { top: 81.39, margin: "auto", expected: 81 }
  ])("activates a native anchor with margin $margin at its sticky-header alignment", ({ top, margin, expected }) => {
    const rect = { id: "selected", top: headingActivationTop(top, margin) };
    expect(rect.top).toBe(expected);
    expect(choosingActiveHeading([{ id: "preceding", top: -120 }, rect], 81, false)).toBe("selected");
  });
});
