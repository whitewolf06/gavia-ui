import { JSDOM } from "jsdom";

const allowedTags = new Set(["path", "circle", "rect", "line", "polyline", "polygon", "ellipse", "g"]);
const allowedAttributes = new Set([
  "d", "cx", "cy", "r", "rx", "ry", "x", "y", "x1", "x2", "y1", "y2",
  "width", "height", "points", "fill", "stroke", "stroke-width",
  "stroke-linecap", "stroke-linejoin", "transform", "opacity"
]);
const { DOMParser } = new JSDOM("").window;
const parser = new DOMParser();

/** Validate one untrusted SVG and return only its serialized shape elements. */
export function validateIcon(file, source) {
  const document = parser.parseFromString(source, "image/svg+xml");
  if (document.querySelector("parsererror")) throw new Error(file + ": malformed SVG");
  if (document.doctype) throw new Error(file + ": DOCTYPE is forbidden");
  const root = document.documentElement;
  if (root.localName !== "svg" || root.namespaceURI !== "http://www.w3.org/2000/svg" ||
      root.getAttribute("viewBox") !== "0 0 24 24") {
    throw new Error(file + ": expected svg with viewBox 0 0 24 24");
  }
  for (const attribute of root.attributes) {
    if (!["xmlns", "viewBox"].includes(attribute.name)) throw new Error(file + ": forbidden root attribute " + attribute.name);
  }
  let shapes = 0;
  function walk(node) {
    for (const child of node.childNodes) {
      if (child.nodeType === 3) {
        if (child.textContent.trim()) throw new Error(file + ": non-whitespace text");
        continue;
      }
      if (child.nodeType !== 1 || !allowedTags.has(child.localName)) throw new Error(file + ": forbidden SVG element");
      shapes += 1;
      for (const attribute of child.attributes) {
        if (!allowedAttributes.has(attribute.name) || /url\s*\(|javascript:/i.test(attribute.value)) {
          throw new Error(file + ": forbidden SVG attribute " + attribute.name);
        }
      }
      walk(child);
    }
  }
  walk(root);
  if (!shapes) throw new Error(file + ": no shapes");
  // DOMParser adds an inherited xmlns to serialized children; the outer WlIcon
  // already supplies the SVG namespace, so keep the original shape markup.
  return root.innerHTML.replaceAll(' xmlns="http://www.w3.org/2000/svg"', "").trim();
}
