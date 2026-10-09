/** Legacy Russian workflows opt in explicitly; unqualified product URLs still default to English. */
export function russianPlaygroundUrl(input: string): string {
  const absolute = /^[a-z][a-z0-9+.-]*:/i.test(input);
  const url = new URL(input, "http://playground.invalid/");
  url.searchParams.set("lang", "ru");
  // Relative URLs keep Playwright's configured origin and the existing Pages prefix.
  return absolute ? url.href : url.pathname + url.search + url.hash;
}
