import fs from 'node:fs/promises';
import path from 'node:path';

async function validateSkills(): Promise<void> {
  const dirIndex = process.argv.indexOf('--dir');
  const targetDir =
    dirIndex !== -1 && dirIndex + 1 < process.argv.length ? process.argv[dirIndex + 1] : 'skills';
  const skillsPath = path.resolve(targetDir);

  try {
    await fs.access(skillsPath);
  } catch {
    console.error(`Error: Directory not found: ${skillsPath}`);
    process.exit(1);
  }

  let hasErrors = false;
  const entries = await fs.readdir(skillsPath, { withFileTypes: true });
  const dirs = entries.filter((e) => e.isDirectory() && !e.name.startsWith('.'));

  await Promise.all(
    dirs.map(async (dir) => {
      const file = path.join(skillsPath, dir.name, 'SKILL.md');
      try {
        const rawContent = await fs.readFile(file, 'utf8');
        const content = rawContent.replace(/^\uFEFF/, '');
        const frontmatter = /^---\r?\n([\s\S]+?)\r?\n---/.exec(content)?.[1] ?? '';

        for (const key of ['name', 'description', 'keywords']) {
          if (!new RegExp(String.raw`(?:^|\n)(?:  )?${key}:\s*\S+`).test(frontmatter)) {
            console.error(
              `Error: Frontmatter '${key}' key missing or empty in ${path.join(targetDir, dir.name, 'SKILL.md')}`
            );
            hasErrors = true;
          }
        }
      } catch {
        console.error(`Error: Missing SKILL.md in ${path.join(targetDir, dir.name)}`);
        hasErrors = true;
      }
    })
  );

  if (hasErrors) process.exit(1);
  console.log('Validation passed successfully.');
}

validateSkills().catch((error: unknown) => {
  console.error('Unhandled error during validation:', error);
  process.exit(1);
});
