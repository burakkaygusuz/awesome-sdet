import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const pkg = require('../package.json') as { name: string; version: string; description?: string };

export const SERVER_NAME = 'sdet-mcp';
export const SERVER_VERSION: string = pkg.version;
export const SERVER_DESCRIPTION: string =
  pkg.description ||
  'Model Context Protocol Server providing test automation tools, resources, and runtime execution.';

export const PROTOCOL_VERSION_2026_07_28 = '2026-07-28';
export const DEFAULT_DOCS_CACHE_TTL_MS = 3_600_000; // 1 hour TTL for immutable reference docs
export const PUBLIC_CACHE_SCOPE = 'public' as const;
