import fs from 'node:fs';
import path from 'node:path';

export interface VersionTargets {
  rootPkgPath: string;
  pluginJsonPath: string;
  serversPkgPath: string;
}

export function getVersionTargets(rootDir = process.cwd()): VersionTargets {
  return {
    rootPkgPath: path.resolve(rootDir, 'package.json'),
    pluginJsonPath: path.resolve(rootDir, 'plugin.json'),
    serversPkgPath: path.resolve(rootDir, 'servers/package.json'),
  };
}

export function calculateNextVersion(currentVersion: string, bumpTypeOrVersion: string): string {
  const clean = (currentVersion.startsWith('v') ? currentVersion.slice(1) : currentVersion).trim();
  const match = new RegExp(/^(\d+)\.(\d+)\.(\d+)$/).exec(clean);
  if (!match) throw new Error(`Invalid current SemVer version: "${currentVersion}"`);
  const [, majorStr, minorStr, patchStr] = match;
  const [major, minor, patch] = [Number(majorStr), Number(minorStr), Number(patchStr)];

  const input = (bumpTypeOrVersion.startsWith('v') ? bumpTypeOrVersion.slice(1) : bumpTypeOrVersion)
    .trim()
    .toLowerCase();

  if (input === 'patch') return `${major}.${minor}.${patch + 1}`;
  if (input === 'minor') return `${major}.${minor + 1}.0`;
  if (input === 'major') return `${major + 1}.0.0`;
  if (/^\d+\.\d+\.\d+$/.test(input)) return input;

  throw new Error(
    `Invalid bump type or SemVer version: "${bumpTypeOrVersion}". Expected "patch", "minor", "major", or "X.Y.Z".`
  );
}

export function determineBumpTypeFromCommits(
  commits: string[]
): 'major' | 'minor' | 'patch' | null {
  const filtered = commits
    .map((c) => c.trim())
    .filter((c) => c.length > 0 && !c.startsWith('chore(release):') && !c.includes('[skip ci]'));

  if (filtered.length === 0) return null;

  const isMajor = filtered.some(
    (c) =>
      /^[a-z0-9_-]+(\([a-z0-9_-]+\))?!:/i.test(c) ||
      /\bBREAKING CHANGE\b/i.test(c) ||
      /^BREAKING-CHANGE:/i.test(c)
  );
  if (isMajor) return 'major';

  const isMinor = filtered.some((c) => /^feat(\([a-z0-9_-]+\))?:/i.test(c));
  if (isMinor) return 'minor';

  return 'patch';
}

export function syncVersions(
  newVersion: string,
  targets: VersionTargets = getVersionTargets()
): { previousVersion: string; newVersion: string } {
  const rootPkg = JSON.parse(fs.readFileSync(targets.rootPkgPath, 'utf8'));
  const previousVersion = rootPkg.version;

  for (const filePath of [targets.rootPkgPath, targets.pluginJsonPath, targets.serversPkgPath]) {
    if (!fs.existsSync(filePath)) continue;
    const json = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    json.version = newVersion;
    fs.writeFileSync(filePath, JSON.stringify(json, null, 2) + '\n', 'utf8');
  }

  return { previousVersion, newVersion };
}
