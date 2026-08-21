import fs from 'node:fs/promises';
import path from 'node:path';
import {
  SkillFrontmatterSchema,
  SkillSchema,
  type CapabilityTopic,
  type Skill,
  type SkillFrontmatter,
} from '../schemas.js';
import { parseMarkdownFrontmatter } from './frontmatter-parser.js';

export function parseFrontmatter(
  content: string,
  relPath: string
): { frontmatter: SkillFrontmatter | null; hasError: boolean } {
  return parseMarkdownFrontmatter(content, relPath, SkillFrontmatterSchema, 'Skill');
}

export async function validateSkillFile(
  filePath: string,
  rootDir: string,
  skillsDir: string
): Promise<{ skill: Skill | null; hasError: boolean; declaredFrameworks?: string[] }> {
  const relPath = path.relative(skillsDir, filePath);
  const content = await fs.readFile(filePath, 'utf8');
  const { frontmatter, hasError: parseError } = parseFrontmatter(content, relPath);

  if (parseError || !frontmatter) {
    return { skill: null, hasError: true, declaredFrameworks: [] };
  }

  let hasError = false;
  const name = frontmatter.name;
  const skillDirName = path.basename(path.dirname(filePath));

  if (name !== skillDirName) {
    console.error(
      `Error: ${relPath}: Frontmatter name '${name}' does not match directory name '${skillDirName}'`
    );
    hasError = true;
  }

  if (content.toLowerCase().includes('freemium')) {
    console.error(`Error: ${relPath}: Contains forbidden keyword 'freemium'`);
    hasError = true;
  }

  if (/file:\/\/\/[a-z]:|\/Users\/|\/home\/|[a-z]:\\/i.test(content)) {
    console.error(`Error: ${relPath}: Contains hardcoded absolute or user-specific file path(s)`);
    hasError = true;
  }

  const frontmatterEnd = content.indexOf('---', 3);
  const body = content.substring(frontmatterEnd + 3).trim();
  const bodyLineCount = body ? body.split('\n').length : 0;

  if (bodyLineCount > 500) {
    console.error(
      `Error: ${relPath}: SKILL.md body is ${bodyLineCount} lines; keep it under 500 lines (guide §3.3)`
    );
    hasError = true;
  }

  if (bodyLineCount > 300 && !/^#{1,6}\s+table of contents\s*$/im.test(body)) {
    console.error(
      `Error: ${relPath}: SKILL.md body exceeds 300 lines without a Table of Contents heading (guide §3.3)`
    );
    hasError = true;
  }

  const description = frontmatter.description || '';
  const descriptionWords = description.split(/\s+/).filter(Boolean).length;
  if (descriptionWords > 100) {
    console.error(
      `Error: ${relPath}: description is ${descriptionWords} words; keep it at or under 100 words (guide §3.2)`
    );
    hasError = true;
  }
  if (description.length >= 1024) {
    console.error(
      `Error: ${relPath}: description is ${description.length} characters; keep it strictly under the 1024-character specification limit (guide §3.2)`
    );
    hasError = true;
  }

  const framework = 'sdet';
  const inferredTopic = skillDirName.startsWith('sdet-') ? skillDirName.substring(5) : skillDirName;
  const topic = (frontmatter.metadata?.capability || inferredTopic) as CapabilityTopic;

  const declaredFrameworks = frontmatter.metadata?.frameworks
    ? frontmatter.metadata.frameworks
        .split(',')
        .map((f) => f.trim())
        .filter(Boolean)
    : [];

  const rawSkill = {
    name: name || skillDirName,
    canonicalName: `sdet/${topic}`,
    framework,
    topic,
    description: frontmatter.description || '',
    filePath: path.relative(rootDir, filePath),
  };

  const schemaParsed = await SkillSchema.safeParseAsync(rawSkill);
  if (!schemaParsed.success) {
    console.error(
      `Error: ${relPath}: Skill schema validation failed:`,
      schemaParsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ')
    );
    hasError = true;
  }

  const skill: Skill | null = hasError ? null : (schemaParsed.data as Skill);

  return { skill, hasError, declaredFrameworks };
}

/**
 * Standard Agent Skills Discovery:
 * Scans direct child directories of `skills/` (MUST NOT recursively search subdirectories).
 */
export async function collectAllSkills(
  rootDir: string,
  skillsDir: string
): Promise<{ skills: Skill[]; frameworks: string[]; hasErrors: boolean }> {
  const entries = await fs.readdir(skillsDir, { withFileTypes: true });
  const skillDirs = entries.filter((entry) => entry.isDirectory());

  const results = await Promise.all(
    skillDirs.map(async (dir) => {
      const skillFilePath = path.join(skillsDir, dir.name, 'SKILL.md');
      try {
        await fs.access(skillFilePath);
        return validateSkillFile(skillFilePath, rootDir, skillsDir);
      } catch {
        console.error(`Error: skills/${dir.name}/SKILL.md does not exist`);
        return { skill: null, hasError: true, declaredFrameworks: [] };
      }
    })
  );

  const skills: Skill[] = [];
  let hasErrors = false;
  const frameworkSet = new Set<string>();

  for (const result of results) {
    if (result.hasError) {
      hasErrors = true;
    }
    if (result.skill) {
      skills.push(result.skill);
      if (result.declaredFrameworks && result.declaredFrameworks.length > 0) {
        for (const fw of result.declaredFrameworks) {
          frameworkSet.add(fw);
        }
      } else {
        frameworkSet.add(result.skill.framework);
      }
    }
  }

  return {
    skills,
    frameworks: Array.from(frameworkSet).sort((a, b) => a.localeCompare(b)),
    hasErrors,
  };
}
