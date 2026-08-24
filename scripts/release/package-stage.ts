import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { z } from 'zod';
import { McpManifestSchema } from '../schemas.js';

const RELEASE_RUNTIME_DEPENDENCIES = [
  '@modelcontextprotocol/node',
  '@modelcontextprotocol/server',
  'zod',
] as const;

const PackageSchema = z.object({
  files: z
    .array(z.string().min(1))
    .min(1, 'package.json must declare a non-empty string "files" array'),
  dependencies: z.record(z.string(), z.string()).optional(),
});

export function stageReleasePackage(rootDir: string, stagingDir: string): string {
  const rootPkgRaw: unknown = JSON.parse(
    fs.readFileSync(path.resolve(rootDir, 'package.json'), 'utf8')
  );
  const rootPackage = PackageSchema.parse(rootPkgRaw);
  const declaredFiles = rootPackage.files;

  const packageDir = path.resolve(stagingDir, 'package');
  fs.mkdirSync(packageDir, { recursive: true });

  for (const relativePath of new Set(['package.json', ...declaredFiles])) {
    const sourcePath = path.resolve(rootDir, relativePath);
    const sourceRelativePath = path.relative(path.resolve(rootDir), sourcePath);
    const destinationPath = path.resolve(packageDir, relativePath);
    const destinationRelativePath = path.relative(packageDir, destinationPath);

    if (
      sourceRelativePath.startsWith('..') ||
      path.isAbsolute(sourceRelativePath) ||
      destinationRelativePath.startsWith('..') ||
      path.isAbsolute(destinationRelativePath)
    ) {
      throw new Error(`Release file path escapes its package root: "${relativePath}"`);
    }

    if (!fs.existsSync(sourcePath)) {
      throw new Error(`Release artifact is missing "${relativePath}"`);
    }

    fs.mkdirSync(path.dirname(destinationPath), { recursive: true });
    fs.cpSync(sourcePath, destinationPath, { recursive: true });
  }

  return packageDir;
}

export function verifyReleasePackage(packageDir: string): void {
  const entrypoint = path.join(packageDir, 'servers/dist/index.js');
  if (!fs.existsSync(entrypoint) || !fs.statSync(entrypoint).isFile()) {
    throw new Error('Release artifact is missing "servers/dist/index.js"');
  }

  const pkgRaw: unknown = JSON.parse(
    fs.readFileSync(path.join(packageDir, 'package.json'), 'utf8')
  );
  const packageJson = PackageSchema.parse(pkgRaw);
  const dependencies = packageJson.dependencies ?? {};

  if (RELEASE_RUNTIME_DEPENDENCIES.some((dep) => typeof dependencies[dep] !== 'string')) {
    throw new Error('Release artifact is missing MCP runtime dependencies');
  }

  const mcpRaw: unknown = JSON.parse(fs.readFileSync(path.join(packageDir, 'mcp.json'), 'utf8'));
  const manifest = McpManifestSchema.parse(mcpRaw);
  const stdioServer = manifest.mcpServers['sdet-mcp'];

  if (
    stdioServer?.type !== 'stdio' ||
    stdioServer.command !== 'node' ||
    stdioServer.args?.[0] !== '${PLUGIN_ROOT}/servers/dist/index.js'
  ) {
    throw new Error('mcp.json does not target the packaged MCP entrypoint');
  }
}

export function validateReleasePackage(rootDir = process.cwd()): void {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'awesome-sdet-release-'));
  try {
    const packageDir = stageReleasePackage(rootDir, tempDir);
    verifyReleasePackage(packageDir);
    console.log(`[verify] Staged release package structure verified successfully.`);
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}
