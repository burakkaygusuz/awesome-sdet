import { createRequire } from 'node:module';

interface PackageJson {
  name: string;
  version: string;
  description?: string;
}

const requireModule = createRequire(import.meta.url);
const pkg: PackageJson = requireModule('../package.json');

export const SERVER_NAME = 'sdet-mcp';
export const SERVER_VERSION: string = pkg.version;
export const SERVER_DESCRIPTION: string =
  pkg.description ||
  'Model Context Protocol Server providing test automation tools, resources, and runtime execution.';

export const PROTOCOL_VERSION_2026_07_28 = '2026-07-28';
export const DEFAULT_DOCS_CACHE_TTL_MS = 3_600_000; // 1 hour TTL for immutable reference docs
export const PUBLIC_CACHE_SCOPE = 'public' as const;
