import { execFileSync } from 'node:child_process';

export function execute(
  command: string,
  args: string[],
  options?: Parameters<typeof execFileSync>[2]
): string {
  const result = execFileSync(command, args, options);
  return result ? result.toString() : '';
}

export function assertCleanWorkingTree(allowDirty = false): void {
  if (allowDirty) return;
  const status = execute('git', ['status', '--porcelain'], { encoding: 'utf8' }).trim();
  if (status.length > 0) {
    throw new Error('Working tree has uncommitted changes. Commit or stash them first.');
  }
}

export function getCommitsSinceLastTag(): string[] {
  let range = '';
  try {
    const latestTag = execute('git', ['describe', '--tags', '--abbrev=0'], {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore'],
    }).trim();
    if (latestTag) range = `${latestTag}..HEAD`;
  } catch {
    // initial repo commit range
  }
  const args = range ? ['log', range, '--format=%s'] : ['log', '--format=%s'];
  const log = execute('git', args, { encoding: 'utf8' }).trim();
  return log ? log.split('\n') : [];
}

export function publishGitHubRelease(version: string): void {
  console.log(`[release] Creating GitHub Release with gh CLI...`);
  try {
    execute(
      'gh',
      ['release', 'create', `v${version}`, '--title', `v${version}`, '--generate-notes'],
      {
        stdio: 'inherit',
      }
    );
    console.log(`[release] Published release v${version} to GitHub.`);
  } catch (err) {
    console.warn(`[warning] Failed to publish GitHub Release via gh CLI: ${String(err)}`);
  }
}

export function pushTagAndRelease(version: string): void {
  try {
    const existing = execute('git', ['tag', '-l', `v${version}`], {
      encoding: 'utf8',
    }).trim();
    if (existing) {
      console.log(`[info] Tag v${version} already exists. Skipping tag creation.`);
      return;
    }
  } catch {
    // ignore git tag check error
  }

  console.log(`[doc] Creating git tag v${version}...`);
  execute('git', ['tag', '-a', `v${version}`, '-m', `Release v${version}`], {
    stdio: 'inherit',
  });
  console.log(`[git] Pushing tag to origin...`);
  execute('git', ['push', 'origin', `v${version}`], { stdio: 'inherit' });
  publishGitHubRelease(version);
}

export function commitAndTagRelease(version: string): void {
  console.log(`\n[doc] Creating release commit and git tag...`);
  execute('git', ['add', 'package.json', 'plugin.json', 'servers/package.json'], {
    stdio: 'inherit',
  });
  execute('git', ['commit', '-m', `chore(release): bump version to ${version}`], {
    stdio: 'inherit',
  });
  console.log(`[git] Pushing release commit to origin...`);
  try {
    execute('git', ['push', 'origin', 'HEAD'], { stdio: 'inherit' });
  } catch (err) {
    console.warn(
      `[warning] Direct push to origin HEAD was declined (e.g. branch protection): ${String(err)}`
    );
  }
  try {
    execute('git', ['push', 'origin', 'HEAD:refs/heads/develop'], { stdio: 'inherit' });
    console.log(`[git] Synchronized release commit to origin/develop.`);
  } catch (err) {
    console.warn(`[warning] Could not push release commit to develop: ${String(err)}`);
  }
  pushTagAndRelease(version);
}
