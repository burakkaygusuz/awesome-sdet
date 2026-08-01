import { defineConfig } from 'eslint/config';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import markdown from '@eslint/markdown';
import markdownlint from 'eslint-plugin-markdownlint';
import eslintConfigPrettier from 'eslint-config-prettier';

export default defineConfig([
  {
    ignores: ['**/dist/**', '**/node_modules/**'],
  },
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
    ...js.configs.recommended,
  },
  ...tseslint.configs.recommended,
  {
    files: ['**/*.md'],
    plugins: {
      markdown,
      markdownlint,
    },
    language: 'markdown/commonmark',
    rules: {
      'markdownlint/md001': 'error',
      'markdownlint/md022': 'error',
      'markdownlint/md024': ['error', { siblings_only: true }],
      'markdownlint/md033': ['error', { allowed_elements: ['a'] }],
    },
  },
  eslintConfigPrettier,
]);
