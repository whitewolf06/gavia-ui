import type { WlSegmentedOption } from "legato-ui";
import { gaviaProjectInfo } from "./project-info";
export type PackageManager = "pnpm" | "npm" | "bun";
export const installationManagers: WlSegmentedOption[] = [
  { label: "pnpm", value: "pnpm" }, { label: "npm", value: "npm" }, { label: "Bun", value: "bun" }
];
export function getInstallCommand(manager: PackageManager, includeVue = false, name = gaviaProjectInfo.packageName): string {
  const prefix = manager === "npm" ? "npm install" : manager + " add";
  return prefix + " " + name + (includeVue ? " vue" : "");
}
