import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {readFileSync} from 'node:fs';
export function releaseChannel(version) {
  if (!/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-(?:alpha|beta|rc)\.(0|[1-9]\d*))?$/.test(version))
    throw new Error('Expected a stable version or alpha/beta/rc.N prerelease');
  return version.includes('-') ? 'next' : 'latest';
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const pkg=JSON.parse(readFileSync(new URL('../packages/ui-kit/package.json',import.meta.url),'utf8'));
  const root=JSON.parse(readFileSync(new URL('../package.json',import.meta.url),'utf8'));
  if (pkg.version!==root.version) throw new Error('Root/package versions differ');
  if (process.env.GITHUB_REF_NAME && process.env.GITHUB_REF_NAME!=='v'+pkg.version)
    throw new Error('Tag/package versions differ');
  console.log(releaseChannel(pkg.version));
}

