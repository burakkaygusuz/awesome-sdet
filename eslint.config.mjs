import { defineConfig } from 'eslint/config';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import markdownlint from 'eslint-plugin-markdownlint';
import markdownlintParser from 'eslint-plugin-markdownlint/parser.js';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';

export default defineConfig([
  {
    ignores: ['**/dist/**', '**/node_modules/**'],
  },
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
    ...js.configs.recommended,
  },
  {
    files: ['**/test/**/*.mjs'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.nodeBuiltin,
      },
    },
  },
  ...tseslint.configs.recommended,
  {
    files: ['**/*.md'],
    plugins: {
      markdownlint,
    },
    languageOptions: {
      parser: markdownlintParser,
    },
    rules: {
      'markdownlint/md001': 'error',
      'markdownlint/md022': 'error',
      'markdownlint/md024': ['error', { siblings_only: true }],
      'markdownlint/md033': ['error', { allowed_elements: ['a'] }],
    },
  },
  eslintConfigPrettier,
]);
