import fs from 'node:fs/promises';
import path from 'node:path';
import { REQUIRED_FRONTMATTER, type Skill } from '../schemas.js';

export function parseFrontmatter(
  content: string,
  relPath: string
): { fields: Record<string, string>; hasError: boolean } {
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
  let hasError = false;

  for (const req of REQUIRED_FRONTMATTER) {
    const regex = new RegExp(String.raw`^${req}:\s*(.+)$`, 'm');
    const match = regex.exec(frontmatter);
    if (match) {
      fields[req] = match[1].trim().replace(/^["']|["']$/g, '');
    } else {
      console.error(`Error: ${relPath}: Missing required frontmatter attribute '${req}'`);
      hasError = true;
    }
  }

  return { fields, hasError };
}

export async function validateSkillFile(
  filePath: string,
  rootDir: string,
  skillsDir: string
): Promise<{ skill: Skill | null; hasError: boolean }> {
  const relPath = path.relative(skillsDir, filePath);
  const content = await fs.readFile(filePath, 'utf8');
  const { fields, hasError: parseError } = parseFrontmatter(content, relPath);

  if (parseError) {
    return { skill: null, hasError: true };
  }

  let hasError = false;
  const name = fields['name'];
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

  const framework = skillDirName.includes('-') ? skillDirName.split('-')[0] : 'common';
  const topic = skillDirName.includes('-')
    ? skillDirName.substring(framework.length + 1)
    : skillDirName;

  const skill: Skill = {
    name: name || skillDirName,
    canonicalName: `${framework}/${topic}`,
    framework,
    topic,
    description: fields['description'] || '',
    filePath: path.relative(rootDir, filePath),
  };

  return { skill, hasError };
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
        return { skill: null, hasError: true };
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
      frameworkSet.add(result.skill.framework);
    }
  }

  return {
    skills,
    frameworks: Array.from(frameworkSet).sort((a, b) => a.localeCompare(b)),
    hasErrors,
  };
}
