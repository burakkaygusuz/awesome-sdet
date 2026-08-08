import fs from 'node:fs/promises';
import path from 'node:path';
import { REQUIRED_FRONTMATTER, type Skill } from '../schemas.ts';

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
  framework: string,
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
  const topicDir = path.basename(path.dirname(filePath));

  if (name !== topicDir) {
    console.error(
      `Error: ${relPath}: Frontmatter name '${name}' does not match directory name '${topicDir}'`
    );
    hasError = true;
  }

  if (content.toLowerCase().includes('freemium')) {
    console.error(`Error: ${relPath}: Contains forbidden keyword 'freemium'`);
    hasError = true;
  }

  const skill: Skill = {
    name: name || topicDir,
    canonicalName: `${framework}/${name || topicDir}`,
    framework,
    topic: topicDir,
    description: fields['description'] || '',
    filePath: path.relative(rootDir, filePath),
  };

  return { skill, hasError };
}

export async function collectFrameworkSkills(
  framework: string,
  rootDir: string,
  skillsDir: string
): Promise<{ skills: Skill[]; hasErrors: boolean }> {
  const frameworkPath = path.join(skillsDir, framework);
  const entries = await fs.readdir(frameworkPath, { recursive: true, withFileTypes: true });

  const skillEntries = entries.filter((entry) => entry.isFile() && entry.name === 'SKILL.md');

  const results = await Promise.all(
    skillEntries.map(async (entry) => {
      const parentDir =
        (entry as unknown as { path?: string; parentPath?: string }).path ||
        (entry as unknown as { parentPath?: string }).parentPath ||
        frameworkPath;
      const filePath = path.join(parentDir, entry.name);
      return validateSkillFile(filePath, framework, rootDir, skillsDir);
    })
  );

  const skills: Skill[] = [];
  let hasErrors = false;

  for (const result of results) {
    if (result.hasError) {
      hasErrors = true;
    }
    if (result.skill) {
      skills.push(result.skill);
    }
  }

  return { skills, hasErrors };
}
