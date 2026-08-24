import fs from 'node:fs';
import {
  calculateNextVersion,
  determineBumpTypeFromCommits,
  getVersionTargets,
  syncVersions,
} from './release/semver.js';
import {
  assertCleanWorkingTree,
  commitAndTagRelease,
  execute,
  getCommitsSinceLastTag,
  pushTagAndRelease,
} from './release/git-operations.js';
import { validateReleasePackage } from './release/package-stage.js';

export {
  calculateNextVersion,
  determineBumpTypeFromCommits,
  getVersionTargets,
  syncVersions,
  assertCleanWorkingTree,
  commitAndTagRelease,
  getCommitsSinceLastTag,
  pushTagAndRelease,
  validateReleasePackage,
};

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

export function resolveTargetVersion(
  currentVersion: string,
  options: ReleaseOptions
): string | null {
  if (options.isAuto) {
    const commits = getCommitsSinceLastTag();
    const autoBump = determineBumpTypeFromCommits(commits);
    if (!autoBump) return null;
    return calculateNextVersion(currentVersion, autoBump);
  }

  const bump = options.bumpTypeOrVersion || 'patch';
  return calculateNextVersion(currentVersion, bump);
}

export function buildAndValidateRelease(): void {
  console.log(`[build] Building assets and MCP server...`);
  execute('pnpm', ['run', 'build'], { stdio: 'inherit' });

  console.log(`[test] Running test suite and validations...`);
  execute('pnpm', ['test'], { stdio: 'inherit' });
  execute('pnpm', ['run', 'validate'], { stdio: 'inherit' });
  validateReleasePackage();
}

function handleTagOnlyRelease(currentVersion: string, isDryRun: boolean): void {
  console.log(
    `\n[tag] Awesome SDET Tag Release Automation (v${currentVersion}, dry-run: ${isDryRun ? 'YES' : 'NO'})\n`
  );
  if (isDryRun) {
    console.log(`[ok] Dry-run: Would create tag v${currentVersion} and push to origin.`);
    return;
  }
  pushTagAndRelease(currentVersion);
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
    console.log('[info] No releaseable changes detected since last tag. Skipping release.');
    return;
  }

  console.log(`\n[release] Awesome SDET Release Automation`);
  console.log(`-----------------------------------`);
  console.log(`Current version: v${currentVersion}`);
  console.log(`Next release:    v${newVersion}`);
  console.log(`Bump only:       ${options.isBumpOnly ? 'YES' : 'NO'}`);
  console.log(`Dry run:         ${options.isDryRun ? 'YES' : 'NO'}\n`);

  if (options.isDryRun) {
    console.log(`[test] Running dry-run validation suite (zero filesystem mutation)...`);
    buildAndValidateRelease();
    console.log(
      `\n[ok] Dry-run succeeded: repository is release-ready for v${newVersion} (no files modified).`
    );
    return;
  }

  assertCleanWorkingTree(options.allowDirty);

  console.log(
    `[pkg] Synchronizing version across package.json, plugin.json, and servers/package.json...`
  );
  syncVersions(newVersion, targets);
  buildAndValidateRelease();

  if (options.isBumpOnly) {
    console.log(`\n[doc] Version files updated to v${newVersion}. (Bump-only mode)`);
    console.log(`Ready to commit and push to release/v${newVersion} branch.`);
    return;
  }

  commitAndTagRelease(newVersion);
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

export { type VersionTargets } from './release/semver.js';
export { verifyReleasePackage, stageReleasePackage } from './release/package-stage.js';

export { publishGitHubRelease } from './release/git-operations.js';
