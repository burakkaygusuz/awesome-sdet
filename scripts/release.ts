import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execSync } from 'node:child_process';

const RELEASE_RUNTIME_DEPENDENCIES = [
  '@modelcontextprotocol/node',
  '@modelcontextprotocol/server',
  'zod',
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readJsonRecord(filePath: string): Record<string, unknown> {
  const parsed: unknown = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  if (!isRecord(parsed)) {
    throw new Error(`Expected a JSON object in "${filePath}"`);
  }

  return parsed;
}

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

export function stageReleasePackage(rootDir: string, stagingDir: string): string {
  const rootPackage = readJsonRecord(path.resolve(rootDir, 'package.json'));
  const declaredFiles = rootPackage.files;

  if (
    !Array.isArray(declaredFiles) ||
    !declaredFiles.every((file): file is string => typeof file === 'string' && file.length > 0)
  ) {
    throw new Error('package.json must declare a non-empty string "files" array');
  }

  const packageDir = path.resolve(stagingDir, 'package');
  fs.mkdirSync(packageDir, { recursive: true });

  for (const relativePath of new Set(['package.json', ...declaredFiles])) {
    const sourcePath = path.resolve(rootDir, relativePath);
    const sourceRelativePath = path.relative(path.resolve(rootDir), sourcePath);
    const destinationPath = path.resolve(packageDir, relativePath);
    const destinationRelativePath = path.relative(packageDir, destinationPath);

    if (
      sourceRelativePath.startsWith('..') ||
      path.isAbsolute(sourceRelativePath) ||
      destinationRelativePath.startsWith('..') ||
      path.isAbsolute(destinationRelativePath)
    ) {
      throw new Error(`Release file path escapes its package root: "${relativePath}"`);
    }

    if (!fs.existsSync(sourcePath)) {
      throw new Error(`Release artifact is missing "${relativePath}"`);
    }

    fs.mkdirSync(path.dirname(destinationPath), { recursive: true });
    fs.cpSync(sourcePath, destinationPath, { recursive: true });
  }

  return packageDir;
}

export function verifyReleasePackage(packageDir: string): void {
  const entrypoint = path.join(packageDir, 'servers/dist/index.js');
  if (!fs.existsSync(entrypoint) || !fs.statSync(entrypoint).isFile()) {
    throw new Error('Release artifact is missing "servers/dist/index.js"');
  }

  const packageJson = readJsonRecord(path.join(packageDir, 'package.json'));
  const dependencies = packageJson.dependencies;
  if (
    !isRecord(dependencies) ||
    RELEASE_RUNTIME_DEPENDENCIES.some((dependency) => typeof dependencies[dependency] !== 'string')
  ) {
    throw new Error('Release artifact is missing MCP runtime dependencies');
  }

  const manifest = readJsonRecord(path.join(packageDir, 'mcp.json'));
  const servers = manifest.mcpServers;
  const stdioServer = isRecord(servers) ? servers['sdet-mcp'] : undefined;
  const args = isRecord(stdioServer) ? stdioServer.args : undefined;

  if (
    !isRecord(stdioServer) ||
    stdioServer.command !== 'node' ||
    !Array.isArray(args) ||
    args[0] !== '${PLUGIN_ROOT}/servers/dist/index.js'
  ) {
    throw new Error('mcp.json does not target the packaged MCP entrypoint');
  }
}

function validateReleasePackage(): void {
  const stagingRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'awesome-sdet-release-'));

  try {
    const packageDir = stageReleasePackage(process.cwd(), stagingRoot);
    verifyReleasePackage(packageDir);
    console.log(`📦 Release package verified at ${packageDir}`);
  } finally {
    fs.rmSync(stagingRoot, { recursive: true, force: true });
  }
}

export function determineBumpTypeFromCommits(
  commits: string[]
): 'major' | 'minor' | 'patch' | null {
  const filtered = commits
    .map((c) => c.trim())
    .filter((c) => c.length > 0 && !c.startsWith('chore(release):') && !c.includes('[skip ci]'));

  if (filtered.length === 0) {
    return null;
  }

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

export function getCommitsSinceLastTag(): string[] {
  try {
    const latestTag = execSync('git describe --tags --abbrev=0 2>/dev/null', {
      encoding: 'utf8',
    }).trim();
    const log = execSync(`git log ${latestTag}..HEAD --oneline`, { encoding: 'utf8' }).trim();
    return log.split('\n').map((l) => l.replace(/^[a-f0-9]+\s+/, ''));
  } catch {
    const log = execSync('git log --oneline', { encoding: 'utf8' }).trim();
    return log.split('\n').map((l) => l.replace(/^[a-f0-9]+\s+/, ''));
  }
}

export interface ReleaseOptions {
  bumpTypeOrVersion?: string;
  isAuto: boolean;
  isDryRun: boolean;
  isBumpOnly: boolean;
  isTagOnly: boolean;
  allowDirty: boolean;
}

export function parseReleaseOptions(argv: string[]): ReleaseOptions {
  const args = argv.slice(2);
  const bumpTypeOrVersion = args.find((a) => !a.startsWith('--'));

  return {
    bumpTypeOrVersion,
    isAuto: args.includes('--auto'),
    isDryRun: args.includes('--dry-run'),
    isBumpOnly: args.includes('--bump-only') || args.includes('--prepare-branch'),
    isTagOnly: args.includes('--tag-only'),
    allowDirty: args.includes('--allow-dirty'),
  };
}

export function assertCleanWorkingTree(allowDirty = false): void {
  if (allowDirty) return;
  const status = execSync('git status --porcelain', { encoding: 'utf8' }).trim();
  if (status.length > 0) {
    throw new Error('Working tree has uncommitted changes. Commit or stash them first.');
  }
}

export function buildAndValidateRelease(): void {
  console.log(`🔨 Building assets and MCP server...`);
  execSync('pnpm run build', { stdio: 'inherit' });

  console.log(`🧪 Running test suite and validations...`);
  execSync('pnpm test', { stdio: 'inherit' });
  execSync('pnpm run validate', { stdio: 'inherit' });
  validateReleasePackage();
}

export function commitAndTagRelease(version: string): void {
  console.log(`\n📝 Creating release commit and git tag...`);
  execSync(`git add package.json plugin.json servers/package.json`, {
    stdio: 'inherit',
  });
  execSync(`git commit -m "chore(release): bump version to ${version}"`, { stdio: 'inherit' });
  execSync(`git tag -a "v${version}" -m "Release v${version}"`, { stdio: 'inherit' });

  console.log(`⬆️ Pushing commit and tag to origin main...`);
  execSync(`git push origin main && git push origin "v${version}"`, { stdio: 'inherit' });
}

export function publishGitHubRelease(version: string): void {
  console.log(`🎉 Creating GitHub Release with gh CLI...`);
  try {
    execSync(`gh release create "v${version}" --title "v${version}" --generate-notes`, {
      stdio: 'inherit',
    });
    console.log(`\n✨ Successfully published GitHub Release v${version}!`);
  } catch (error) {
    console.error(
      '⚠️ Warning: Failed to create GitHub Release via gh CLI. Tag was pushed to remote.',
      error
    );
  }
}

export function resolveTargetVersion(
  currentVersion: string,
  options: ReleaseOptions
): string | null {
  if (options.isAuto) {
    const commits = getCommitsSinceLastTag();
    const autoBump = determineBumpTypeFromCommits(commits);
    if (!autoBump) {
      return null;
    }
    return calculateNextVersion(currentVersion, autoBump);
  }

  const bump = options.bumpTypeOrVersion || 'patch';
  return calculateNextVersion(currentVersion, bump);
}

function handleTagOnlyRelease(currentVersion: string, isDryRun: boolean): void {
  console.log(`\n🏷️ Awesome SDET Tag Release Automation`);
  console.log(`--------------------------------------`);
  console.log(`Current version: v${currentVersion}`);
  console.log(`Dry run:         ${isDryRun ? 'YES' : 'NO'}\n`);

  if (isDryRun) {
    console.log(`✅ Dry-run: Would create tag v${currentVersion} and push to origin.`);
    return;
  }

  console.log(`📝 Creating git tag v${currentVersion}...`);
  execSync(`git tag -a "v${currentVersion}" -m "Release v${currentVersion}"`, {
    stdio: 'inherit',
  });
  console.log(`⬆️ Pushing tag to origin...`);
  execSync(`git push origin "v${currentVersion}"`, { stdio: 'inherit' });
  publishGitHubRelease(currentVersion);
}

export async function runRelease(
  options: ReleaseOptions = parseReleaseOptions(process.argv)
): Promise<void> {
  const targets = getVersionTargets();
  const rootPkg = JSON.parse(fs.readFileSync(targets.rootPkgPath, 'utf8'));
  const currentVersion: string = rootPkg.version;

  if (options.isTagOnly) {
    handleTagOnlyRelease(currentVersion, options.isDryRun);
    return;
  }

  const newVersion = resolveTargetVersion(currentVersion, options);
  if (!newVersion) {
    console.log('ℹ️ No releaseable changes detected since last tag. Skipping release.');
    return;
  }

  console.log(`\n🚀 Awesome SDET Release Automation`);
  console.log(`-----------------------------------`);
  console.log(`Current version: v${currentVersion}`);
  console.log(`Next release:    v${newVersion}`);
  console.log(`Bump only:       ${options.isBumpOnly ? 'YES' : 'NO'}`);
  console.log(`Dry run:         ${options.isDryRun ? 'YES' : 'NO'}\n`);

  if (!options.isDryRun) {
    assertCleanWorkingTree(options.allowDirty);
  }

  console.log(
    `📦 Synchronizing version across package.json, plugin.json, and servers/package.json...`
  );
  syncVersions(newVersion, targets);

  buildAndValidateRelease();

  if (options.isDryRun) {
    console.log(`\n✅ Dry-run completed successfully for v${newVersion}. Reverting changes...`);
    syncVersions(currentVersion, targets);
    execSync('pnpm run build', { stdio: 'inherit' });
    return;
  }

  if (options.isBumpOnly) {
    console.log(`\n📝 Version files updated to v${newVersion}. (Bump-only mode)`);
    console.log(`Ready to commit and push to release/v${newVersion} branch.`);
    return;
  }

  commitAndTagRelease(newVersion);
  publishGitHubRelease(newVersion);
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
