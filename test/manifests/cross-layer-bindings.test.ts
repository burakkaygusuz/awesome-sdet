import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../');

async function collectKnowledgeFiles(): Promise<string[]> {
  const files: string[] = [];
  const skillsDir = path.join(rootDir, 'skills');
  for (const entry of await fs.readdir(skillsDir, { withFileTypes: true })) {
    if (entry.isDirectory()) files.push(path.join(skillsDir, entry.name, 'SKILL.md'));
  }
  const agentsDir = path.join(rootDir, 'agents');
  for (const entry of await fs.readdir(agentsDir, { withFileTypes: true })) {
    if (entry.isFile() && entry.name.endsWith('.agent.md')) {
      files.push(path.join(agentsDir, entry.name));
    } else if (entry.isDirectory()) {
      for (const nested of await fs.readdir(path.join(agentsDir, entry.name))) {
        if (nested.endsWith('.agent.md')) {
          files.push(path.join(agentsDir, entry.name, nested));
        }
      }
    }
  }
  return files;
}

describe('cross-layer binding contract (skills/agents <-> MCP registry)', () => {
  it('every MCP tool name and universal resource URI cited in skills and agents exists in the registry', async () => {
    const registeredTools = new Set<string>(['read_sdet_docs', 'verify_test_artifact']);

    const validResourceUris = new Set([
      'sdet://guidelines',
      'sdet://invariants',
      'sdet://migration-matrix',
    ]);

    const files = await collectKnowledgeFiles();
    expect(files.length).toBeGreaterThanOrEqual(13);

    const toolOffenders: string[] = [];
    const uriOffenders: string[] = [];

    for (const file of files) {
      const content = await fs.readFile(file, 'utf8');
      const rel = path.relative(rootDir, file);

      for (const tool of content.match(
        /\b(?:read_(?:sdet|pw|se|cy|vibium|appium)_[a-z_]+|verify_test_artifact)\b/g
      ) ?? []) {
        if (!registeredTools.has(tool)) toolOffenders.push(`${rel}: ${tool}`);
      }

      for (const [uri] of content.matchAll(/\bsdet:\/\/[a-z-]+/g)) {
        if (!validResourceUris.has(uri)) {
          uriOffenders.push(`${rel}: ${uri}`);
        }
      }
    }

    expect(toolOffenders).toEqual([]);
    expect(uriOffenders).toEqual([]);
  });

  it('every skills/ file path cited in agents and skills exists on disk', async () => {
    const files = await collectKnowledgeFiles();
    const pathOffenders: string[] = [];

    for (const file of files) {
      const content = await fs.readFile(file, 'utf8');
      const rel = path.relative(rootDir, file);
      for (const cited of content.match(/skills\/sdet-[a-z-]+\/[\w./-]+\.md/g) ?? []) {
        const resolved = path.join(rootDir, cited);
        try {
          await fs.access(resolved);
        } catch {
          pathOffenders.push(`${rel}: ${cited}`);
        }
      }
    }

    expect(pathOffenders).toEqual([]);
  });
});
