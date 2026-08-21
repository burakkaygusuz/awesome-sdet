import fs from 'node:fs/promises';
import path from 'node:path';
import { SkillsManifestSchema, type Skill, type SkillsManifest } from './schemas.js';
import { collectAgents } from './validators/agent-validator.js';
import { validateMcpManifest, validatePluginManifest } from './validators/manifest-validator.js';
import { collectAllSkills } from './validators/skills-validator.js';
import { validateSnippets } from './validators/snippets-validator.js';

export async function validate(): Promise<void> {
  const rootDir = process.cwd();
  const skillsDir = path.join(rootDir, 'skills');

  const [pluginValid, mcpValid, agentResult, skillResult, snippetsValid] = await Promise.all([
    validatePluginManifest(rootDir),
    validateMcpManifest(rootDir),
    collectAgents(rootDir),
    collectAllSkills(rootDir, skillsDir),
    validateSnippets(rootDir),
  ]);

  const hasErrors =
    !pluginValid || !mcpValid || !snippetsValid || agentResult.hasErrors || skillResult.hasErrors;

  if (hasErrors) {
    process.exit(1);
  }

  const skillsByFramework = skillResult.skills.reduce<Record<string, Skill[]>>((acc, skill) => {
    acc[skill.framework] ??= [];
    acc[skill.framework].push(skill);
    return acc;
  }, {});

  const manifestData: SkillsManifest = {
    schemaVersion: '1.0.0',
    generatedAt: new Date().toISOString(),
    totalSkills: skillResult.skills.length,
    totalAgents: agentResult.agents.length,
    frameworks: skillResult.frameworks,
    agents: agentResult.agents,
    skills: skillsByFramework,
  };

  const parsedManifest = SkillsManifestSchema.safeParse(manifestData);
  if (!parsedManifest.success) {
    console.error(
      'Error: Generated skills manifest schema validation failed:',
      parsedManifest.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ')
    );
    process.exit(1);
  }

  const distDir = path.join(rootDir, 'dist');
  await fs.mkdir(distDir, { recursive: true });
  await fs.writeFile(
    path.join(distDir, 'skills-manifest.json'),
    JSON.stringify(manifestData, null, 2) + '\n'
  );

  console.log(
    `Validation passed. Plugin manifest, MCP configuration, ${agentResult.agents.length} agent(s), and ${skillResult.skills.length} skills across ${skillResult.frameworks.length} framework(s) valid.`
  );
}

if (process.argv[1]?.includes('validate')) {
  validate().catch((err) => {
    console.error('Validation crashed:', err);
    process.exit(1);
  });
}
