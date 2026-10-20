function contentText(element: Element): string {
  const content = element.cloneNode(true) as Element;
  content.querySelectorAll('[aria-hidden="true"], [hidden], [inert], script, style').forEach((node) => node.remove());
  return content.textContent?.replace(/\s+/g, " ").trim() ?? "";
}

function referencedElement(element: HTMLElement, id: string): Element | undefined {
  const root = element.getRootNode() as Node & ParentNode;
  if (root instanceof Element && root.id === id) return root;
  return Array.from(root.querySelectorAll<Element>("[id]")).find((node) => node.id === id);
}

/** Name sources used by native actions, including detached Vue roots and shadow trees. */
export function hasWlAccessibleName(element: HTMLElement, ignoredSelectors: readonly string[] = []): boolean {
  const references = element.getAttribute("aria-labelledby")?.trim().split(/\s+/).filter(Boolean) ?? [];
  if (references.some((id) => {
    const label = referencedElement(element, id);
    return label !== undefined && contentText(label).length > 0;
  })) return true;
  if (element.getAttribute("aria-label")?.trim()) return true;
  const labelled = element as HTMLElement & { labels?: NodeListOf<HTMLLabelElement> | null };
  if (Array.from(labelled.labels ?? []).some((label) => contentText(label))) return true;
  const content = element.cloneNode(true) as HTMLElement;
  for (const selector of ignoredSelectors) content.querySelectorAll(selector).forEach((node) => node.remove());
  return contentText(content).length > 0 || !!element.getAttribute("title")?.trim();
}
