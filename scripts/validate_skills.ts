import fs from 'node:fs';
import path from 'node:path';

const dirIndex = process.argv.indexOf('--dir');
const targetDir =
  dirIndex !== -1 && dirIndex + 1 < process.argv.length ? process.argv[dirIndex + 1] : 'skills';
const skillsPath = path.resolve(targetDir);

if (!fs.existsSync(skillsPath)) {
  console.error(`Error: Directory not found: ${skillsPath}`);
  process.exit(1);
}

let hasErrors = false;

for (const dir of fs.readdirSync(skillsPath, { withFileTypes: true })) {
  if (!dir.isDirectory() || dir.name.startsWith('.')) continue;

  const file = path.join(skillsPath, dir.name, 'SKILL.md');
  if (!fs.existsSync(file)) {
    console.error(`Error: Missing SKILL.md in ${path.join(targetDir, dir.name)}`);
    hasErrors = true;
    continue;
  }

  const content = fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '');
  const frontmatter = /^---\r?\n([\s\S]+?)\r?\n---/.exec(content)?.[1] ?? '';

  for (const key of ['name', 'description', 'keywords']) {
    if (!new RegExp(String.raw`(?:^|\n)(?:  )?${key}:\s*\S+`).test(frontmatter)) {
      console.error(
        `Error: Frontmatter '${key}' key missing or empty in ${path.join(targetDir, dir.name, 'SKILL.md')}`
      );
      hasErrors = true;
    }
  }
}

if (hasErrors) process.exit(1);
console.log('Validation passed successfully.');
