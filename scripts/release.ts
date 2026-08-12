import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

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
  const cleanCurrent = currentVersion.replace(/^v/, '').trim();
  const parts = cleanCurrent.split('.').map((p) => Number.parseInt(p, 10));

  if (parts.length !== 3 || parts.some((p) => Number.isNaN(p))) {
    throw new Error(`Invalid current SemVer version: "${currentVersion}"`);
  }

  const [major, minor, patch] = parts;
  const input = bumpTypeOrVersion.replace(/^v/, '').trim().toLowerCase();

  switch (input) {
    case 'patch':
      return `${major}.${minor}.${patch + 1}`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'major':
      return `${major + 1}.0.0`;
    default: {
      const explicitParts = input.split('.').map((p) => Number.parseInt(p, 10));
      if (explicitParts.length !== 3 || explicitParts.some((p) => Number.isNaN(p))) {
        throw new Error(
          `Invalid bump type or SemVer version: "${bumpTypeOrVersion}". Expected "patch", "minor", "major", or "X.Y.Z".`
        );
      }
      return input;
    }
  }
}

export function syncVersions(
  newVersion: string,
  targets: VersionTargets = getVersionTargets()
): { previousVersion: string; newVersion: string } {
  const rootPkg = JSON.parse(fs.readFileSync(targets.rootPkgPath, 'utf8'));
  const previousVersion = rootPkg.version;

  rootPkg.version = newVersion;
  fs.writeFileSync(targets.rootPkgPath, JSON.stringify(rootPkg, null, 2) + '\n', 'utf8');

  if (fs.existsSync(targets.pluginJsonPath)) {
    const pluginJson = JSON.parse(fs.readFileSync(targets.pluginJsonPath, 'utf8'));
    pluginJson.version = newVersion;
    fs.writeFileSync(targets.pluginJsonPath, JSON.stringify(pluginJson, null, 2) + '\n', 'utf8');
  }

  if (fs.existsSync(targets.serversPkgPath)) {
    const serversPkg = JSON.parse(fs.readFileSync(targets.serversPkgPath, 'utf8'));
    serversPkg.version = newVersion;
    fs.writeFileSync(targets.serversPkgPath, JSON.stringify(serversPkg, null, 2) + '\n', 'utf8');
  }

  return { previousVersion, newVersion };
}

export async function runRelease(): Promise<void> {
  const args = process.argv.slice(2);
  const bumpArg = args[0] || 'patch';
  const isDryRun = args.includes('--dry-run');

  const targets = getVersionTargets();
  const rootPkg = JSON.parse(fs.readFileSync(targets.rootPkgPath, 'utf8'));
  const currentVersion: string = rootPkg.version;
  const newVersion = calculateNextVersion(currentVersion, bumpArg);

  console.log(`\n🚀 Awesome SDET Release Automation`);
  console.log(`-----------------------------------`);
  console.log(`Current version: v${currentVersion}`);
  console.log(`Next release:    v${newVersion}`);
  console.log(`Dry run:         ${isDryRun ? 'YES' : 'NO'}\n`);

  if (!isDryRun) {
    const status = execSync('git status --porcelain', { encoding: 'utf8' }).trim();
    if (status.length > 0 && !args.includes('--allow-dirty')) {
      console.error('❌ Error: Working tree has uncommitted changes. Commit or stash them first.');
      process.exit(1);
    }
  }

  console.log(
    `📦 Synchronizing version across package.json, plugin.json, and servers/package.json...`
  );
  syncVersions(newVersion, targets);

  console.log(`🔨 Building assets and MCP server...`);
  execSync('pnpm run build', { stdio: 'inherit' });

  console.log(`🧪 Running test suite and validations...`);
  execSync('pnpm test', { stdio: 'inherit' });
  execSync('pnpm run validate', { stdio: 'inherit' });

  if (isDryRun) {
    console.log(`\n✅ Dry-run completed successfully for v${newVersion}. Reverting changes...`);
    syncVersions(currentVersion, targets);
    execSync('pnpm run build', { stdio: 'inherit' });
    return;
  }

  console.log(`\n📝 Creating release commit and git tag...`);
  execSync(`git add package.json plugin.json servers/package.json`, {
    stdio: 'inherit',
  });
  execSync(`git commit -m "chore(release): v${newVersion}"`, { stdio: 'inherit' });
  execSync(`git tag -a "v${newVersion}" -m "Release v${newVersion}"`, { stdio: 'inherit' });

  console.log(`⬆️ Pushing commit and tag to origin main...`);
  execSync(`git push origin main && git push origin "v${newVersion}"`, { stdio: 'inherit' });

  console.log(`🎉 Creating GitHub Release with gh CLI...`);
  try {
    execSync(`gh release create "v${newVersion}" --title "v${newVersion}" --generate-notes`, {
      stdio: 'inherit',
    });
    console.log(`\n✨ Successfully published GitHub Release v${newVersion}!`);
  } catch (error) {
    console.error(
      '⚠️ Warning: Failed to create GitHub Release via gh CLI. Tag was pushed to remote.',
      error
    );
  }
}

const isDirectExecution =
  process.argv[1] &&
  (process.argv[1].endsWith('release.ts') || process.argv[1].endsWith('release.js'));

if (isDirectExecution) {
  runRelease().catch((err) => {
    console.error('Release failed:', err);
    process.exit(1);
  });
}
