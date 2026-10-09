import { author, version } from "../../../../packages/ui-kit/package.json";

/** Public project metadata shared by the showcase and its navigation. */
export const gaviaProjectInfo = {
  name: "Gavia UI",
  version,
  author,
  repositoryUrl: "https://github.com/whitewolf06/gavia-ui",
  documentationBaseUrl: "https://github.com/whitewolf06/gavia-ui/blob/main/",
  license: "MIT",
  licenseUrl: "https://github.com/whitewolf06/gavia-ui/blob/main/LICENSE",
  instructionsUrl: "https://github.com/whitewolf06/gavia-ui/blob/main/README.md",
  contributingUrl: "https://github.com/whitewolf06/gavia-ui/blob/main/CONTRIBUTING.md",
  changelogUrl: "https://github.com/whitewolf06/gavia-ui/blob/main/CHANGELOG.md",
  packageName: "gavia-ui",
  packageUrl: "https://www.npmjs.com/package/gavia-ui",
  publishedVersion: "0.11.1",
  npmPublished: true
} as const;
