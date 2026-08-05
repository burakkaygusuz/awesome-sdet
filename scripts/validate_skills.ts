import fs from 'node:fs/promises';
import path from 'node:path';

interface Skill {
  name: string;
  canonicalName: string;
  framework: string;
  topic: string;
  description: string;
  path: string;
}

async function validateSkills(): Promise<void> {
  const dirIdx = process.argv.indexOf('--dir');
  const targetDir =
    dirIdx !== -1 && dirIdx + 1 < process.argv.length ? process.argv[dirIdx + 1] : 'skills';
  const skillsPath = path.resolve(targetDir);

  const frameworks: Record<string, Skill[]> = {};
  let totalSkills = 0;
  let hasErrors = false;

  const entries = await fs.readdir(skillsPath, { recursive: true, withFileTypes: true });
  const skillFiles = entries.filter((e) => e.isFile() && e.name === 'SKILL.md');

  await Promise.all(
    skillFiles.map(async (file) => {
      const parentDir = file.parentPath ?? (file as unknown as { path: string }).path;
      const filePath = path.join(parentDir, file.name);
      const relPath = path.relative(process.cwd(), filePath);
      const parts = relPath.split(path.sep);

      const topic = parts[parts.length - 2];
      const frameworkDir = parts[parts.length - 3];

      try {
        const content = await fs.readFile(filePath, 'utf8');
        const frontmatter = /^---\r?\n([\s\S]+?)\r?\n---/.exec(content)?.[1] || '';

        const getVal = (key: string) =>
          new RegExp(String.raw`(?:^|\n)(?:  )?${key}:\s*(.+)`).exec(frontmatter)?.[1]?.trim() ||
          '';

        const name = getVal('name');
        const description = getVal('description');
        const framework = getVal('framework') || frameworkDir;
        const hasKeywords = new RegExp(String.raw`(?:^|\n)(?:  )?keywords:\s*\S+`).test(
          frontmatter
        );

        if (!name || !description || !framework || !hasKeywords) {
          console.error(`Error: Frontmatter validation failed in ${relPath}`);
          hasErrors = true;
        } else if (name !== topic) {
          console.error(
            `Error: Skill name '${name}' must match directory '${topic}' in ${relPath}`
          );
          hasErrors = true;
        } else {
          frameworks[framework] = frameworks[framework] || [];
          frameworks[framework].push({
            name,
            canonicalName: `${framework}-${name}`,
            framework,
            topic,
            description,
            path: relPath,
          });
          totalSkills++;
        }
      } catch (err) {
        console.error(`Error reading ${relPath}:`, err);
        hasErrors = true;
      }
    })
  );

  if (hasErrors) process.exit(1);

  await fs.mkdir('dist', { recursive: true });
  await fs.writeFile(
    'dist/skills-manifest.json',
    JSON.stringify({ generatedAt: new Date().toISOString(), totalSkills, frameworks }, null, 2)
  );

  console.log(
    `Validation passed. Manifest generated with ${totalSkills} skills across ${
      Object.keys(frameworks).length
    } framework(s).`
  );
}

validateSkills().catch((err) => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
