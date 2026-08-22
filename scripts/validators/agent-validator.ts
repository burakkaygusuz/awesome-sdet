import fs from 'node:fs/promises';
import path from 'node:path';
import {
  AgentFrontmatterSchema,
  AgentInfoSchema,
  CAPABILITY_SKILL_NAMES,
  type AgentFrontmatter,
  type AgentInfo,
} from '../schemas.js';
import { parseMarkdownFrontmatter } from '../parsers/frontmatter-parser.js';

const VALID_RESOURCE_URIS = new Set([
  'sdet://guidelines',
  'sdet://invariants',
  'sdet://migration-matrix',
]);

const LEGACY_TOOLS = [
  'read_pw_docs',
  'read_se_docs',
  'read_cy_docs',
  'read_vibium_docs',
  'read_appium_docs',
];

const VALID_FRAMEWORKS = new Set(['playwright', 'selenium', 'cypress', 'vibium', 'appium']);

function validateAgentMetadata(
  frontmatter: AgentFrontmatter,
  filePath: string,
  relPath: string
): boolean {
  let hasError = false;
  const { name, description } = frontmatter;

  const fileName = path.basename(filePath).split('.')[0];
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

  for (const legacyTool of LEGACY_TOOLS) {
    if (content.toLowerCase().includes(legacyTool)) {
      console.error(
        `Error: ${relPath}: Contains obsolete legacy tool reference '${legacyTool}'; use 'read_sdet_docs'`
      );
      hasError = true;
    }
  }

  return hasError;
}

function validateAgentReferences(content: string, relPath: string): boolean {
  let hasError = false;

  const skillRefs = content.match(/skills\/sdet-[a-z0-9-]+/g) ?? [];
  for (const ref of skillRefs) {
    const skillName = path.basename(ref);
    if (!CAPABILITY_SKILL_NAMES.includes(skillName as (typeof CAPABILITY_SKILL_NAMES)[number])) {
      console.error(`Error: ${relPath}: References unknown skill '${skillName}'`);
      hasError = true;
    }
  }

  const resourceRefs = content.match(/sdet:\/\/[a-z0-9_-]+/g) ?? [];
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

  const { frontmatter, hasError: parseError } = parseMarkdownFrontmatter(
    content,
    relPath,
    AgentFrontmatterSchema,
    'Agent'
  );
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
        const parentDir = entry.parentPath ?? agentsDir;
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

    for (const fw of VALID_FRAMEWORKS) {
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
