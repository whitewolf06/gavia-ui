import type { WlConfigOptions, WlLink, WlNavItem } from "../src";

type LinkProps = InstanceType<typeof WlLink>["$props"];
type NavProps = InstanceType<typeof WlNavItem>["$props"];

export function routerLinkTypes(): void {
  const link: LinkProps = { to: { name: "home" }, target: "_blank", rel: "noopener", external: true };
  const routeNav: NavProps = { to: { name: "home" }, target: "_blank", rel: "noopener" };
  const routeString: NavProps = { to: "/home", target: "_self" };
  const plainNav: NavProps = { label: "Action" };
  const config: WlConfigOptions = {};
  // @ts-expect-error Button navigation does not accept anchor-only targets.
  const invalidButton: NavProps = { label: "Action", target: "_blank" };
  // @ts-expect-error Native link href remains a URL string.
  const invalidHref: LinkProps = { href: { name: "home" } };
  void [link, routeNav, routeString, plainNav, config, invalidButton, invalidHref];
}
