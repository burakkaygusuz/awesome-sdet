import fs from 'node:fs/promises';
import path from 'node:path';
import type { Skill } from './schemas.ts';
import { validatePluginManifest } from './validators/plugin-validator.ts';
import { validateMcpManifest } from './validators/mcp-validator.ts';
import { collectFrameworkSkills } from './validators/skills-validator.ts';
import { collectAgents } from './validators/agent-validator.ts';

export async function validate(): Promise<void> {
  const rootDir = process.cwd();
  const skillsDir = path.join(rootDir, 'skills');

  // Validate manifests, agents, and discover skill frameworks concurrently
  const [pluginValid, mcpValid, agentResult, entries] = await Promise.all([
    validatePluginManifest(rootDir),
    validateMcpManifest(rootDir),
    collectAgents(rootDir),
    fs.readdir(skillsDir, { withFileTypes: true }),
  ]);

  let hasErrors = !pluginValid || !mcpValid || agentResult.hasErrors;

  const frameworkDirs = entries.filter((e) => e.isDirectory()).map((e) => e.name);

  // Validate skills across all frameworks in parallel
  const frameworkResults = await Promise.all(
    frameworkDirs.map(async (framework) => {
      const result = await collectFrameworkSkills(framework, rootDir, skillsDir);
      return { framework, ...result };
    })
  );

  const skillsByFramework: Record<string, Skill[]> = {};
  let totalSkills = 0;

  for (const { framework, skills, hasErrors: frameworkHasErrors } of frameworkResults) {
    if (frameworkHasErrors) {
      hasErrors = true;
    }
    skillsByFramework[framework] = skills;
    totalSkills += skills.length;
  }

  if (hasErrors) {
    process.exit(1);
  }

  const distDir = path.join(rootDir, 'dist');
  await fs.mkdir(distDir, { recursive: true });
  await fs.writeFile(
    path.join(distDir, 'skills-manifest.json'),
    JSON.stringify(
      {
        schemaVersion: '1.0.0',
        generatedAt: new Date().toISOString(),
        totalSkills,
        totalAgents: agentResult.agents.length,
        frameworks: frameworkDirs,
        agents: agentResult.agents,
        skills: skillsByFramework,
      },
      null,
      2
    )
  );

  console.log(
    `Validation passed. Plugin manifest, MCP configuration, ${agentResult.agents.length} agent(s), and ${totalSkills} skills across ${frameworkDirs.length} framework(s) valid.`
  );
}

validate().catch((err) => {
  console.error('Validation script failed unexpectedly:', err);
  process.exit(1);
});
