import { defineConfig } from 'eslint/config';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import sonarjs from 'eslint-plugin-sonarjs';
import nodePlugin from 'eslint-plugin-n';
import vitestPlugin from '@vitest/eslint-plugin';
import jsonPlugin from '@eslint/json';
import markdownlint from 'eslint-plugin-markdownlint';
import markdownlintParser from 'eslint-plugin-markdownlint/parser.js';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';

export default defineConfig([
  {
    ignores: ['**/dist/**', '**/node_modules/**', 'pnpm-lock.yaml'],
  },
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
    ...js.configs.recommended,
    ...sonarjs.configs.recommended,
    ...nodePlugin.configs['flat/recommended-module'],
    plugins: {
      sonarjs: sonarjs.configs.recommended.plugins.sonarjs,
      n: nodePlugin.configs['flat/recommended-module'].plugins.n,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...sonarjs.configs.recommended.rules,
      ...nodePlugin.configs['flat/recommended-module'].rules,
      'n/no-missing-import': 'off',
      'n/no-unpublished-import': 'off',
      'n/no-process-exit': 'off',
    },
  },
  ...tseslint.configs.recommended,
  {
    files: ['**/test/**/*.mjs'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.nodeBuiltin,
      },
    },
  },
  {
    files: ['**/test/**/*', '**/evals/**/*'],
    ...vitestPlugin.configs.recommended,
  },
  {
    files: ['evals/**/*'],
    rules: {
      'vitest/no-conditional-expect': 'off',
    },
  },
  {
    files: ['**/*.json'],
    ignores: ['package-lock.json', 'tsconfig*.json', '**/tsconfig*.json'],
    language: 'json/json',
    ...jsonPlugin.configs.recommended,
  },
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
