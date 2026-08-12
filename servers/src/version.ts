import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const pkg = require('../package.json') as { name: string; version: string; description?: string };

export const SERVER_NAME = 'sdet-mcp';
export const SERVER_VERSION: string = pkg.version;
export const SERVER_DESCRIPTION: string =
  pkg.description ||
  'Model Context Protocol Server providing test automation tools, resources, and runtime execution.';
