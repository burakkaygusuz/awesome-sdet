import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {
  calculateNextVersion,
  determineBumpTypeFromCommits,
  parseReleaseOptions,
  resolveTargetVersion,
  syncVersions,
  type VersionTargets,
} from '../../scripts/release.js';
import { PluginManifestSchema } from '../../scripts/schemas.js';

describe('Release Version Calculation & Sync', () => {
  let tempDir: string;
  let targets: VersionTargets;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'release-test-'));
    const serversDir = path.join(tempDir, 'servers');
    fs.mkdirSync(serversDir, { recursive: true });

    targets = {
      rootPkgPath: path.join(tempDir, 'package.json'),
      pluginJsonPath: path.join(tempDir, 'plugin.json'),
      serversPkgPath: path.join(serversDir, 'package.json'),
    };

    fs.writeFileSync(
      targets.rootPkgPath,
      JSON.stringify(
        {
          name: 'awesome-sdet',
          version: '1.0.0',
          description: 'Enterprise SDET Agent Plugin',
        },
        null,
        2
      ),
      'utf8'
    );
    fs.writeFileSync(
      targets.pluginJsonPath,
      JSON.stringify(
        {
          $schema: 'https://agent-plugins.org/schemas/1.0.0/plugin.schema.json',
          name: 'awesome-sdet',
          version: '1.0.0',
          description: 'Enterprise SDET Agent Plugin',
        },
        null,
        2
      ),
      'utf8'
    );
    fs.writeFileSync(
      targets.serversPkgPath,
      JSON.stringify({ name: 'sdet-mcp', version: '1.0.0' }, null, 2),
      'utf8'
    );
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('calculates next patch version correctly', () => {
    expect(calculateNextVersion('1.0.0', 'patch')).toBe('1.0.1');
    expect(calculateNextVersion('1.2.3', 'patch')).toBe('1.2.4');
  });

  it('calculates next minor version correctly', () => {
    expect(calculateNextVersion('1.0.0', 'minor')).toBe('1.1.0');
    expect(calculateNextVersion('1.2.5', 'minor')).toBe('1.3.0');
  });

  it('calculates next major version correctly', () => {
    expect(calculateNextVersion('1.0.0', 'major')).toBe('2.0.0');
    expect(calculateNextVersion('1.9.4', 'major')).toBe('2.0.0');
  });

  it('accepts explicit SemVer versions with or without v prefix', () => {
    expect(calculateNextVersion('1.0.0', '1.5.2')).toBe('1.5.2');
    expect(calculateNextVersion('1.0.0', 'v2.1.0')).toBe('2.1.0');
  });

  it('throws for invalid SemVer versions', () => {
    expect(() => calculateNextVersion('invalid', 'patch')).toThrow();
    expect(() => calculateNextVersion('1.0.0', 'invalid-bump')).toThrow();
  });

  it('synchronizes version across all target files', () => {
    const res = syncVersions('1.1.0', targets);
    expect(res.previousVersion).toBe('1.0.0');
    expect(res.newVersion).toBe('1.1.0');

    const root = JSON.parse(fs.readFileSync(targets.rootPkgPath, 'utf8'));
    const plugin = JSON.parse(fs.readFileSync(targets.pluginJsonPath, 'utf8'));
    const servers = JSON.parse(fs.readFileSync(targets.serversPkgPath, 'utf8'));

    expect(root.version).toBe('1.1.0');
    expect(plugin.version).toBe('1.1.0');
    expect(servers.version).toBe('1.1.0');
  });

  it('supports custom SemVer increment steps', () => {
    const res = syncVersions('2.0.0', targets);
    expect(res.newVersion).toBe('2.0.0');

    const root = JSON.parse(fs.readFileSync(targets.rootPkgPath, 'utf8'));
    expect(root.version).toBe('2.0.0');
  });

  it('ensures synchronized plugin.json strictly satisfies PluginManifestSchema', () => {
    syncVersions('1.2.0', targets);

    const plugin = JSON.parse(fs.readFileSync(targets.pluginJsonPath, 'utf8'));
    const parsed = PluginManifestSchema.safeParse(plugin);

    expect(parsed.success).toBe(true);
    expect(plugin.$schema).toBe('https://agent-plugins.org/schemas/1.0.0/plugin.schema.json');
    expect(plugin.version).toBe('1.2.0');
  });

  it('preserves canonical $schema URL and metadata attributes without mutation during sync', () => {
    syncVersions('3.0.0', targets);

    const plugin = JSON.parse(fs.readFileSync(targets.pluginJsonPath, 'utf8'));
    expect(plugin.$schema).toBe('https://agent-plugins.org/schemas/1.0.0/plugin.schema.json');
    expect(plugin.name).toBe('awesome-sdet');
    expect(plugin.description).toBe('Enterprise SDET Agent Plugin');
  });

  it('asserts zero version drift across active manifests in repository root and servers', () => {
    const actualTargets = {
      rootPkgPath: path.resolve(process.cwd(), 'package.json'),
      pluginJsonPath: path.resolve(process.cwd(), 'plugin.json'),
      serversPkgPath: path.resolve(process.cwd(), 'servers/package.json'),
    };

    const root = JSON.parse(fs.readFileSync(actualTargets.rootPkgPath, 'utf8'));
    const plugin = JSON.parse(fs.readFileSync(actualTargets.pluginJsonPath, 'utf8'));
    const servers = JSON.parse(fs.readFileSync(actualTargets.serversPkgPath, 'utf8'));

    expect(plugin.version).toBe(root.version);
    expect(servers.version).toBe(root.version);
  });

  describe('determineBumpTypeFromCommits', () => {
    it('returns major for breaking changes in conventional commit format', () => {
      expect(determineBumpTypeFromCommits(['feat!: remove legacy api', 'fix: bug'])).toBe('major');
      expect(determineBumpTypeFromCommits(['feat(mcp)!: breaking schema change'])).toBe('major');
      expect(
        determineBumpTypeFromCommits(['refactor: rewrite parser\n\nBREAKING CHANGE: new ast'])
      ).toBe('major');
    });

    it('returns minor for feat commits', () => {
      expect(determineBumpTypeFromCommits(['feat: add new verification rule', 'fix: typos'])).toBe(
        'minor'
      );
      expect(determineBumpTypeFromCommits(['feat(skills): add new locator guide'])).toBe('minor');
    });

    it('returns patch for fix, docs, perf, chore, and refactor commits', () => {
      expect(determineBumpTypeFromCommits(['fix: address edge case', 'docs: update readme'])).toBe(
        'patch'
      );
      expect(determineBumpTypeFromCommits(['perf: optimize tree-sitter caching'])).toBe('patch');
    });

    it('returns null when no releaseable commits exist', () => {
      expect(determineBumpTypeFromCommits([])).toBeNull();
      expect(determineBumpTypeFromCommits(['chore(release): bump version to 1.3.1'])).toBeNull();
      expect(determineBumpTypeFromCommits(['docs: typo [skip ci]'])).toBeNull();
    });
  });

  describe('parseReleaseOptions', () => {
    it('parses default CLI flags accurately', () => {
      const options = parseReleaseOptions(['node', 'release.js']);
      expect(options.isAuto).toBe(false);
      expect(options.isDryRun).toBe(false);
      expect(options.isBumpOnly).toBe(false);
      expect(options.isTagOnly).toBe(false);
      expect(options.allowDirty).toBe(false);
      expect(options.bumpTypeOrVersion).toBeUndefined();
    });

    it('parses flags and bump argument accurately', () => {
      const options = parseReleaseOptions([
        'node',
        'release.js',
        'minor',
        '--auto',
        '--dry-run',
        '--allow-dirty',
      ]);
      expect(options.isAuto).toBe(true);
      expect(options.isDryRun).toBe(true);
      expect(options.allowDirty).toBe(true);
      expect(options.bumpTypeOrVersion).toBe('minor');
    });
  });

  describe('resolveTargetVersion', () => {
    it('resolves explicit version or fallback bump', () => {
      expect(
        resolveTargetVersion('1.0.0', {
          bumpTypeOrVersion: 'minor',
          isAuto: false,
          isDryRun: false,
          isBumpOnly: false,
          isTagOnly: false,
          allowDirty: false,
        })
      ).toBe('1.1.0');

      expect(
        resolveTargetVersion('1.0.0', {
          isAuto: false,
          isDryRun: false,
          isBumpOnly: false,
          isTagOnly: false,
          allowDirty: false,
        })
      ).toBe('1.0.1');
    });
  });
});
