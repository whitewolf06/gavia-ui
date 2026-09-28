import { describe, expect, it } from "vitest";
import { validateIcon } from "../scripts/validate-icon.mjs";

const svg = (body, attrs = "") => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" ${attrs}>${body}</svg>`;

describe("batch icon validator", () => {
  it("accepts a 24px monochrome shape and returns only the validated body", () => {
    expect(validateIcon("safe.svg", svg('<path d="M2 2L22 22"/>'))).toContain("<path");
  });

  it.each([
    ["wrong viewBox", '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M1 1"/></svg>'],
    ["root sizing", svg('<path d="M1 1"/>', 'width="24"')],
    ["script", svg('<script>alert(1)</script>')],
    ["event handler", svg('<path d="M1 1" onclick="alert(1)"/>')],
    ["external resource", svg('<path d="M1 1" fill="url(https://example.com/x)"/>')],
    ["foreign element", svg('<foreignObject><div>bad</div></foreignObject>')],
    ["doctype", '<!DOCTYPE svg><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M1 1"/></svg>']
  ])("rejects %s", (_label, source) => {
    expect(() => validateIcon("bad.svg", source)).toThrow();
  });
});
