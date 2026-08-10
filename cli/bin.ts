#!/usr/bin/env node
import { runCli } from './index.js';

runCli().catch((err: unknown) => {
  console.error('Error running awesome-sdet CLI:', err);
  process.exit(1);
});
