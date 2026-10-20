import type { WlSegmentedOption } from "gavia-ui";
import { gaviaProjectInfo } from "./project-info";
export type PackageManager = "pnpm" | "npm" | "bun";
export const installationManagers: WlSegmentedOption[] = [
  { label: "pnpm", value: "pnpm" }, { label: "npm", value: "npm" }, { label: "Bun", value: "bun" }
];
export function getInstallCommand(manager: PackageManager, includeVue = false): string {
  const prefix = manager === "npm" ? "npm install" : manager + " add";
  return prefix + " " + gaviaProjectInfo.packageName + (includeVue ? " vue" : "");
}
