import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { InstallOptions, InstallResult, McpServerEntry } from './types.js';
import { getSkillsForFrameworksAsync, getAgentsForFrameworks } from './matrix.js';
import { mergeMcpConfig, mergeOpencodeConfig, mergeCodexConfig } from './config-merger.js';
import { generateAgentsMarkdown } from './agents-generator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function resolveRepoRoot(dir: string): string {
  let current = dir;
  while (current !== path.dirname(current)) {
    if (
      fsSync.existsSync(path.join(current, 'skills')) &&
      fsSync.existsSync(path.join(current, 'package.json'))
    ) {
      return current;
    }
    current = path.dirname(current);
  }
  return path.resolve(dir, '../');
}

const REPO_ROOT = resolveRepoRoot(__dirname);

async function pathExists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

export async function runInstallation(options: InstallOptions): Promise<InstallResult> {
  const dest = path.resolve(options.destDir);
  const skillsSourceDir = path.join(REPO_ROOT, 'skills');
  const selectedSkills = await getSkillsForFrameworksAsync(options.frameworks, skillsSourceDir);
  const selectedAgents = getAgentsForFrameworks(options.frameworks);

  // 1. Copy selected skills into .agents/skills/ concurrently
  const destSkillsDir = path.join(dest, '.agents', 'skills');
  await fs.mkdir(destSkillsDir, { recursive: true });

  const skillCopyPromises = selectedSkills.map(async (skill) => {
    const src = path.join(skillsSourceDir, skill);
    const target = path.join(destSkillsDir, skill);
    if (await pathExists(src)) {
      await fs.cp(src, target, { recursive: true });
      return 1;
    }
    return 0;
  });

  const skillResults = await Promise.all(skillCopyPromises);
  const skillsCopied = skillResults.reduce<number>((a, b) => a + b, 0);

  // 2. Copy selected agents into agents/ concurrently
  const destAgentsDir = path.join(dest, 'agents');
  await fs.mkdir(destAgentsDir, { recursive: true });

  const agentCopyPromises = selectedAgents.map(async (agentPath) => {
    const src = path.join(REPO_ROOT, agentPath);
    const target = path.join(destAgentsDir, path.basename(agentPath));
    if (await pathExists(src)) {
      await fs.copyFile(src, target);
      return 1;
    }
    return 0;
  });

  const agentResults = await Promise.all(agentCopyPromises);
  const agentsCopied = agentResults.reduce<number>((a, b) => a + b, 0);

  // 3. Write universal AGENTS.md
  const agentsMdContent = generateAgentsMarkdown();
  await fs.writeFile(path.join(dest, 'AGENTS.md'), agentsMdContent, 'utf8');

  // 4. Update MCP and harness configs selectively based on target filters
  const mcpServerEntry: McpServerEntry = {
    command: 'node',
    args: [path.join(REPO_ROOT, 'servers', 'dist', 'index.js'), '--stdio'],
  };

  const targets = options.targets && options.targets.length > 0 ? options.targets : ['all'];
  const isAll = targets.includes('all');
  const configsUpdated: string[] = [];
  const configPromises: Promise<void>[] = [];

  // .mcp.json (Claude Code / Cursor standard)
  if (isAll || targets.includes('claude') || targets.includes('cursor')) {
    configPromises.push(
      mergeMcpConfig(path.join(dest, '.mcp.json'), mcpServerEntry).then(() => {
        configsUpdated.push('.mcp.json');
      })
    );
  }

  // mcp_config.json (Google Antigravity / Gemini CLI standard)
  if (isAll || targets.includes('gemini')) {
    configPromises.push(
      mergeMcpConfig(path.join(dest, 'mcp_config.json'), mcpServerEntry).then(() => {
        configsUpdated.push('mcp_config.json');
      })
    );
  }

  // opencode.json (OpenCode standard)
  if (isAll || targets.includes('opencode')) {
    configPromises.push(
      mergeOpencodeConfig(path.join(dest, 'opencode.json'), mcpServerEntry).then(() => {
        configsUpdated.push('opencode.json');
      })
    );
  }

  // .codex/config.toml (OpenAI Codex CLI standard)
  if (isAll || targets.includes('codex')) {
    configPromises.push(
      mergeCodexConfig(path.join(dest, '.codex', 'config.toml'), mcpServerEntry).then(() => {
        configsUpdated.push('.codex/config.toml');
      })
    );
  }

  await Promise.all(configPromises);

  return { skillsCopied, agentsCopied, configsUpdated };
}
