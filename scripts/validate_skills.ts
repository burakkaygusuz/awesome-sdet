import fs from 'node:fs';
import path from 'node:path';

interface SkillMetadata {
  name?: string;
  description?: string;
}

function parseSimpleYAML(yamlStr: string): SkillMetadata {
  const metadata: SkillMetadata = {};
  const lines = yamlStr.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }
    const colonIndex = trimmed.indexOf(':');
    if (colonIndex !== -1) {
      const key = trimmed.slice(0, colonIndex).trim();
      const value = trimmed
        .slice(colonIndex + 1)
        .trim()
        .replace(/^["']|["']$/g, '');

      if (key === 'name') {
        metadata.name = value;
      } else if (key === 'description') {
        metadata.description = value;
      }
    }
  }

  return metadata;
}

const args = process.argv.slice(2);
const dirArgIndex = args.indexOf('--dir');
const targetDir = dirArgIndex !== -1 && args[dirArgIndex + 1] ? args[dirArgIndex + 1] : 'skills';

const skillsPath = path.resolve(targetDir);

if (!fs.existsSync(skillsPath)) {
  console.error(`Error: Directory not found: ${skillsPath}`);
  process.exit(1);
}

const items = fs.readdirSync(skillsPath, { withFileTypes: true });
let hasErrors = false;

for (const item of items) {
  if (item.name.startsWith('.')) {
    continue;
  }

  if (item.isDirectory()) {
    const skillDir = path.join(skillsPath, item.name);
    const skillMdPath = path.join(skillDir, 'SKILL.md');

    try {
      if (!fs.existsSync(skillMdPath)) {
        console.error(`Error: Missing SKILL.md in directory: skills/${item.name}`);
        hasErrors = true;
        continue;
      }

      const content = fs.readFileSync(skillMdPath, 'utf8').replace(/^\uFEFF/, '');
      const frontmatterMatch = new RegExp(/^---\r?\n([\s\S]+?)\r?\n---(?:\r?\n|$)/).exec(content);

      if (!frontmatterMatch) {
        console.error(`Error: Missing or invalid YAML frontmatter in skills/${item.name}/SKILL.md`);
        hasErrors = true;
        continue;
      }

      const metadata = parseSimpleYAML(frontmatterMatch[1]);
      if (!metadata.name) {
        console.error(
          `Error: Frontmatter 'name' key is missing or invalid in skills/${item.name}/SKILL.md`
        );
        hasErrors = true;
      }
      if (!metadata.description) {
        console.error(
          `Error: Frontmatter 'description' key is missing or invalid in skills/${item.name}/SKILL.md`
        );
        hasErrors = true;
      }
    } catch (e: unknown) {
      let msg: string;
      if (e instanceof Error) {
        msg = e.message;
      } else if (typeof e === 'string') {
        msg = e;
      } else {
        msg = JSON.stringify(e);
      }
      console.error(`Error: Failed to process skills/${item.name}/SKILL.md: ${msg}`);
      hasErrors = true;
    }
  }
}

if (hasErrors) {
  process.exit(1);
} else {
  console.log('Validation passed successfully.');
  process.exit(0);
}
