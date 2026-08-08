import fs from 'node:fs/promises';
import path from 'node:path';

export interface AgentInfo {
  name: string;
  description: string;
  filePath: string;
}

export async function validateAgentFile(
  filePath: string,
  rootDir: string
): Promise<{ agent: AgentInfo | null; hasError: boolean }> {
  const relPath = path.relative(rootDir, filePath);
  const content = await fs.readFile(filePath, 'utf8');

  if (!content.startsWith('---')) {
    console.error(`Error: ${relPath}: Missing frontmatter start delimiter '---'`);
    return { agent: null, hasError: true };
  }

  const frontmatterEnd = content.indexOf('---', 3);
  if (frontmatterEnd === -1) {
    console.error(`Error: ${relPath}: Missing frontmatter end delimiter '---'`);
    return { agent: null, hasError: true };
  }

  const frontmatter = content.substring(3, frontmatterEnd);
  let hasError = false;

  const nameMatch = /^name:\s*(.+)$/m.exec(frontmatter);
  const descMatch = /^description:\s*(.+)$/m.exec(frontmatter);

  if (!nameMatch) {
    console.error(`Error: ${relPath}: Missing required frontmatter attribute 'name'`);
    hasError = true;
  }

  if (!descMatch) {
    console.error(`Error: ${relPath}: Missing required frontmatter attribute 'description'`);
    hasError = true;
  }

  if (content.toLowerCase().includes('freemium')) {
    console.error(`Error: ${relPath}: Contains forbidden keyword 'freemium'`);
    hasError = true;
  }

  const name = nameMatch ? nameMatch[1].trim().replace(/^["']|["']$/g, '') : '';
  const description = descMatch ? descMatch[1].trim().replace(/^["']|["']$/g, '') : '';

  return {
    agent: hasError ? null : { name, description, filePath: relPath },
    hasError,
  };
}

export async function collectAgents(
  rootDir: string
): Promise<{ agents: AgentInfo[]; hasErrors: boolean }> {
  const agentsDir = path.join(rootDir, 'agents');
  try {
    const entries = await fs.readdir(agentsDir, { recursive: true, withFileTypes: true });
    const agentEntries = entries.filter(
      (entry) => entry.isFile() && (entry.name.endsWith('.agent.md') || entry.name.endsWith('.md'))
    );

    const results = await Promise.all(
      agentEntries.map(async (entry) => {
        const parentDir =
          (entry as unknown as { path?: string; parentPath?: string }).path ||
          (entry as unknown as { parentPath?: string }).parentPath ||
          agentsDir;
        const filePath = path.join(parentDir, entry.name);
        return validateAgentFile(filePath, rootDir);
      })
    );

    const agents: AgentInfo[] = [];
    let hasErrors = false;

    for (const result of results) {
      if (result.hasError) {
        hasErrors = true;
      }
      if (result.agent) {
        agents.push(result.agent);
      }
    }

    return { agents, hasErrors };
  } catch {
    return { agents: [], hasErrors: false };
  }
}
