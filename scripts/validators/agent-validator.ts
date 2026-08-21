import fs from 'node:fs/promises';
import path from 'node:path';
import YAML from 'yaml';
import {
  AgentFrontmatterSchema,
  AgentInfoSchema,
  CAPABILITY_SKILL_NAMES,
  type AgentFrontmatter,
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

function parseFrontmatter(
  content: string,
  relPath: string
): {
  frontmatter: AgentFrontmatter | null;
  hasError: boolean;
} {
  if (!content.startsWith('---')) {
    console.error(`Error: ${relPath}: Missing frontmatter start delimiter '---'`);
    return { frontmatter: null, hasError: true };
  }

  const frontmatterEnd = content.indexOf('---', 3);
  if (frontmatterEnd === -1) {
    console.error(`Error: ${relPath}: Missing frontmatter end delimiter '---'`);
    return { frontmatter: null, hasError: true };
  }

  const frontmatter = content.substring(3, frontmatterEnd);
  let parsedYaml: unknown;
  try {
    parsedYaml = YAML.parse(frontmatter);
  } catch (err) {
    console.error(`Error: ${relPath}: Failed to parse YAML frontmatter: ${String(err)}`);
    return { frontmatter: null, hasError: true };
  }

  if (typeof parsedYaml !== 'object' || parsedYaml === null) {
    console.error(`Error: ${relPath}: Frontmatter must be a valid YAML dictionary`);
    return { frontmatter: null, hasError: true };
  }

  const parsed = AgentFrontmatterSchema.safeParse(parsedYaml);
  if (!parsed.success) {
    console.error(
      `Error: ${relPath}: Agent frontmatter validation failed:`,
      parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ')
    );
    return { frontmatter: null, hasError: true };
  }

  return { frontmatter: parsed.data, hasError: false };
}

function validateAgentMetadata(
  frontmatter: AgentFrontmatter,
  filePath: string,
  relPath: string
): boolean {
  let hasError = false;
  const { name, description } = frontmatter;

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

  return hasError;
}

function validateAgentContentBans(content: string, relPath: string): boolean {
  let hasError = false;

  if (content.toLowerCase().includes('freemium')) {
    console.error(`Error: ${relPath}: Contains forbidden keyword 'freemium'`);
    hasError = true;
  }

  if (/file:\/\/\/[a-z]:|\/Users\/|\/home\/|[a-z]:\\/i.test(content)) {
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

  return hasError;
}

function validateAgentReferences(content: string, relPath: string): boolean {
  let hasError = false;

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

  return hasError;
}

function validateAgentDirectives(content: string, relPath: string): boolean {
  let hasError = false;

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

  return hasError;
}

export async function validateAgentFile(
  filePath: string,
  rootDir: string
): Promise<{ agent: AgentInfo | null; hasError: boolean }> {
  const relPath = path.relative(rootDir, filePath);
  const content = await fs.readFile(filePath, 'utf8');

  const { frontmatter, hasError: parseError } = parseFrontmatter(content, relPath);
  if (parseError || !frontmatter) {
    return { agent: null, hasError: true };
  }

  const metaError = validateAgentMetadata(frontmatter, filePath, relPath);
  const bansError = validateAgentContentBans(content, relPath);
  const refsError = validateAgentReferences(content, relPath);
  const directivesError = validateAgentDirectives(content, relPath);

  const hasValidationErrors = metaError || bansError || refsError || directivesError;

  const name = frontmatter.name;
  const description = frontmatter.description;
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
  }

  const hasError = hasValidationErrors || !schemaParsed.success;

  return {
    agent: hasError ? null : schemaParsed.data,
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
