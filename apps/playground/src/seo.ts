import { translate, playgroundLocale } from "./i18n";
import { getLocalizedManifest } from "./documentation/manifest";
import { createPlaygroundUrl, type PlaygroundRoute } from "./navigation";

const baseUrl = "https://whitewolf06.github.io/gavia-ui/";
const imageUrl = baseUrl + "gavia-social.png";
function meta(attribute: "name" | "property", key: string, value: string): void {
  let element = document.head.querySelector<HTMLMetaElement>('meta[' + attribute + '="' + key + '"]');
  if (!element) { element = document.createElement("meta"); element.setAttribute(attribute, key); document.head.append(element); }
  element.content = value;
}
function link(rel: string, href: string, language?: string): void {
  const selector = 'link[rel="' + rel + '"]' + (language ? '[hreflang="' + language + '"]' : "");
  let element = document.head.querySelector<HTMLLinkElement>(selector);
  if (!element) { element = document.createElement("link"); element.rel = rel; if (language) element.hreflang = language; document.head.append(element); }
  element.href = href;
}
export function updatePlaygroundSeo(route: PlaygroundRoute): void {
  if (typeof document === "undefined") return;
  const locale = playgroundLocale.value === "ru" ? "ru" : "en";
  const page = route.view === "components" ? "docs" : route.view;
  let title = translate("shell.seo." + page + ".title");
  let description = translate("shell.seo." + page + ".description");
  if (page === "docs" && route.component) {
    const entry = getLocalizedManifest().find((item) => item.name === route.component);
    if (entry) { title = entry.name + " — " + translate("shell.seo.docs.title"); description = entry.description || description; }
  } else if (page === "docs" && route.section) {
    title = translate("shell.seo.section." + route.section) + " — " + title;
  }
  const url = createPlaygroundUrl(new URL(baseUrl), route);
  url.searchParams.set("lang", locale);
  document.documentElement.lang = locale;
  document.title = title;
  meta("name", "description", description);
  meta("property", "og:type", "website");
  meta("property", "og:site_name", "Gavia UI");
  meta("property", "og:title", title);
  meta("property", "og:description", description);
  meta("property", "og:url", url.href);
  meta("property", "og:image", imageUrl);
  meta("property", "og:image:alt", "Gavia UI");
  meta("property", "og:locale", locale === "ru" ? "ru_RU" : "en_US");
  meta("property", "og:locale:alternate", locale === "ru" ? "en_US" : "ru_RU");
  meta("name", "twitter:card", "summary");
  meta("name", "twitter:title", title);
  meta("name", "twitter:description", description);
  meta("name", "twitter:image", imageUrl);
  link("canonical", url.href);
  for (const language of ["en", "ru", "x-default"]) {
    const alternate = new URL(url.href);
    alternate.searchParams.set("lang", language === "ru" ? "ru" : "en");
    link("alternate", alternate.href, language);
  }
  let schema = document.head.querySelector<HTMLScriptElement>("#gavia-structured-data");
  if (!schema) { schema = document.createElement("script"); schema.id = "gavia-structured-data"; schema.type = "application/ld+json"; document.head.append(schema); }
  schema.textContent = JSON.stringify({
    "@context": "https://schema.org", "@type": "SoftwareSourceCode",
    name: "Gavia UI", description, url: baseUrl, codeRepository: "https://github.com/whitewolf06/gavia-ui",
    programmingLanguage: ["TypeScript", "Vue", "CSS"], license: "https://opensource.org/license/mit",
    author: { "@type": "Person", name: "Dmitry Gorbach", url: "https://gorbach-dev.ru/" },
    inLanguage: locale
  });
}
