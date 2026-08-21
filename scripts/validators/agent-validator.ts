import fs from 'node:fs/promises';
import path from 'node:path';
import {
  AgentFrontmatterSchema,
  AgentInfoSchema,
  CAPABILITY_SKILL_NAMES,
  type AgentInfo,
} from '../schemas.js';

const VALID_RESOURCE_URIS = new Set([
  'sdet://guidelines',
  'sdet://invariants',
  'sdet://migration-matrix',
]);

const LEGACY_TOOL_PATTERNS = [
  /\bread_pw_docs\b/i,
  /\bread_se_docs\b/i,
  /\bread_cy_docs\b/i,
  /\bread_vibium_docs\b/i,
  /\bread_appium_docs\b/i,
];

const VALID_FRAMEWORKS = new Set(['playwright', 'selenium', 'cypress', 'vibium', 'appium']);

function parseFrontmatterFields(
  content: string,
  relPath: string
): {
  fields: Record<string, string>;
  hasError: boolean;
} {
  if (!content.startsWith('---')) {
    console.error(`Error: ${relPath}: Missing frontmatter start delimiter '---'`);
    return { fields: {}, hasError: true };
  }

  const frontmatterEnd = content.indexOf('---', 3);
  if (frontmatterEnd === -1) {
    console.error(`Error: ${relPath}: Missing frontmatter end delimiter '---'`);
    return { fields: {}, hasError: true };
  }

  const frontmatter = content.substring(3, frontmatterEnd);
  const fields: Record<string, string> = {};

  for (const line of frontmatter.split('\n')) {
    const match = /^([a-zA-Z0-9_-]+):\s*(.*)$/.exec(line.trim());
    if (match) {
      fields[match[1]] = match[2].trim().replace(/^["']|["']$/g, '');
    }
  }

  return { fields, hasError: false };
}

export async function validateAgentFile(
  filePath: string,
  rootDir: string
): Promise<{ agent: AgentInfo | null; hasError: boolean }> {
  const relPath = path.relative(rootDir, filePath);
  const content = await fs.readFile(filePath, 'utf8');

  const { fields, hasError: parseError } = parseFrontmatterFields(content, relPath);
  if (parseError) {
    return { agent: null, hasError: true };
  }

  let hasError = false;

  const parsedFrontmatter = AgentFrontmatterSchema.safeParse(fields);
  if (!parsedFrontmatter.success) {
    console.error(
      `Error: ${relPath}: Agent frontmatter validation failed:`,
      parsedFrontmatter.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ')
    );
    hasError = true;
  }

  const name = fields['name'] || '';
  const description = fields['description'] || '';

  const fileName = path.basename(filePath).replace(/\.agent\.md$|\.md$/, '');
  const dirName = path.basename(path.dirname(filePath));
  if (name !== fileName && name !== dirName) {
    console.error(
      `Error: ${relPath}: Frontmatter name '${name}' must match file name '${fileName}' or directory '${dirName}'`
    );
    hasError = true;
  }

  const descriptionWords = description.split(/\s+/).filter(Boolean).length;
  if (descriptionWords > 100) {
    console.error(
      `Error: ${relPath}: description is ${descriptionWords} words; keep it at or under 100 words`
    );
    hasError = true;
  }
  if (description.length >= 1024) {
    console.error(
      `Error: ${relPath}: description is ${description.length} characters; keep it strictly under 1024 characters`
    );
    hasError = true;
  }

  if (content.toLowerCase().includes('freemium')) {
    console.error(`Error: ${relPath}: Contains forbidden keyword 'freemium'`);
    hasError = true;
  }

  if (/file:\/\/\/[a-zA-Z]:|\/Users\/|\/home\/|[a-zA-Z]:\\/i.test(content)) {
    console.error(`Error: ${relPath}: Contains hardcoded absolute or user-specific file path(s)`);
    hasError = true;
  }

  for (const legacyPattern of LEGACY_TOOL_PATTERNS) {
    if (legacyPattern.test(content)) {
      console.error(
        `Error: ${relPath}: Contains obsolete legacy tool reference matching ${legacyPattern.source}; use 'read_sdet_docs'`
      );
      hasError = true;
    }
  }

  const skillRefs = content.match(/skills\/sdet-[a-z0-9-]+/g) || [];
  for (const ref of skillRefs) {
    const skillName = path.basename(ref);
    if (!CAPABILITY_SKILL_NAMES.includes(skillName as (typeof CAPABILITY_SKILL_NAMES)[number])) {
      console.error(`Error: ${relPath}: References unknown skill '${skillName}'`);
      hasError = true;
    }
  }

  const resourceRefs = content.match(/sdet:\/\/[a-z0-9_-]+/g) || [];
  for (const ref of resourceRefs) {
    if (!VALID_RESOURCE_URIS.has(ref)) {
      console.error(`Error: ${relPath}: References unknown resource URI '${ref}'`);
      hasError = true;
    }
  }

  if (!content.includes('verify_test_artifact')) {
    console.error(
      `Error: ${relPath}: Missing mandatory verification tool directive 'verify_test_artifact'`
    );
    hasError = true;
  }

  if (!content.includes('bounded') && !content.includes('self-repair')) {
    console.error(
      `Error: ${relPath}: Missing mandatory bounded self-repair directive in agent execution playbook`
    );
    hasError = true;
  }

  const framework = VALID_FRAMEWORKS.has(name) ? name : undefined;
  const rawAgent: AgentInfo = {
    name,
    canonicalName: framework ? `sdet/${framework}` : 'sdet/orchestrator',
    description,
    filePath: relPath,
    framework,
  };

  const schemaParsed = AgentInfoSchema.safeParse(rawAgent);
  if (!schemaParsed.success) {
    console.error(
      `Error: ${relPath}: AgentInfo schema validation failed:`,
      schemaParsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ')
    );
    hasError = true;
  }

  return {
    agent: hasError ? null : (schemaParsed.data as AgentInfo),
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
    const seenNames = new Set<string>();

    for (const result of results) {
      if (result.hasError) {
        hasErrors = true;
      }
      if (result.agent) {
        if (seenNames.has(result.agent.name)) {
          console.error(`Error: Duplicate agent name '${result.agent.name}' found`);
          hasErrors = true;
        } else {
          seenNames.add(result.agent.name);
          agents.push(result.agent);
        }
      }
    }

    const expectedFrameworks = ['playwright', 'selenium', 'cypress', 'vibium', 'appium'];
    for (const fw of expectedFrameworks) {
      if (!seenNames.has(fw)) {
        console.error(`Error: Missing expected specialist agent for framework '${fw}'`);
        hasErrors = true;
      }
    }

    if (!seenNames.has('sdet')) {
      console.error("Error: Missing master orchestrator agent 'sdet'");
      hasErrors = true;
    }

    return { agents, hasErrors };
  } catch {
    return { agents: [], hasErrors: false };
  }
}
