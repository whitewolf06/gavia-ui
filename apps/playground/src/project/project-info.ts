import packageMetadata from "../../../../packages/ui-kit/package.json" with { type: "json" };
import published from "./published-package.json" with { type: "json" };
const { author, version } = packageMetadata;
const repositoryUrl = packageMetadata.repository.url.replace(/^git\+/, "").replace(/\.git$/, "");
const documentationBaseUrl = repositoryUrl + "/blob/main/";

/** Public project metadata shared by the showcase and its navigation. */
export const gaviaProjectInfo = {
  name: "Legato UI",
  version,
  author,
  repositoryUrl,
  documentationBaseUrl,
  license: "MIT",
  licenseUrl: documentationBaseUrl + "LICENSE",
  instructionsUrl: documentationBaseUrl + "README.md",
  contributingUrl: documentationBaseUrl + "CONTRIBUTING.md",
  changelogUrl: documentationBaseUrl + "CHANGELOG.md",
  packageName: packageMetadata.name,
  publishedName: published.name,
  packageUrl: "https://www.npmjs.com/package/" + published.name,
  publishedVersion: published.version,
  npmPublished: true
} as const;
