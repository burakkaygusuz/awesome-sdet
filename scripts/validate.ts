import fs from 'node:fs/promises';
import path from 'node:path';
import type { Skill } from './schemas.ts';
import { validatePluginManifest } from './validators/plugin-validator.ts';
import { validateMcpManifest } from './validators/mcp-validator.ts';
import { collectAllSkills } from './validators/skills-validator.ts';
import { collectAgents } from './validators/agent-validator.ts';

export async function validate(): Promise<void> {
  const rootDir = process.cwd();
  const skillsDir = path.join(rootDir, 'skills');

  // Validate manifests, agents, and standard skills concurrently
  const [pluginValid, mcpValid, agentResult, skillResult] = await Promise.all([
    validatePluginManifest(rootDir),
    validateMcpManifest(rootDir),
    collectAgents(rootDir),
    collectAllSkills(rootDir, skillsDir),
  ]);

  const hasErrors = !pluginValid || !mcpValid || agentResult.hasErrors || skillResult.hasErrors;

  if (hasErrors) {
    process.exit(1);
  }

  const skillsByFramework: Record<string, Skill[]> = {};
  for (const skill of skillResult.skills) {
    if (!skillsByFramework[skill.framework]) {
      skillsByFramework[skill.framework] = [];
    }
    skillsByFramework[skill.framework].push(skill);
  }

  const distDir = path.join(rootDir, 'dist');
  await fs.mkdir(distDir, { recursive: true });
  await fs.writeFile(
    path.join(distDir, 'skills-manifest.json'),
    JSON.stringify(
      {
        schemaVersion: '1.0.0',
        generatedAt: new Date().toISOString(),
        totalSkills: skillResult.skills.length,
        totalAgents: agentResult.agents.length,
        frameworks: skillResult.frameworks,
        agents: agentResult.agents,
        skills: skillsByFramework,
      },
      null,
      2
    )
  );

  console.log(
    `Validation passed. Plugin manifest, MCP configuration, ${agentResult.agents.length} agent(s), and ${skillResult.skills.length} skills across ${skillResult.frameworks.length} framework(s) valid.`
  );
}

if (process.argv[1]?.endsWith('validate.ts')) {
  validate().catch((err) => {
    console.error('Validation crashed:', err);
    process.exit(1);
  });
}
