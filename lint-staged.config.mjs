export default {
  '*.{ts,js,mjs}': ['eslint --fix', 'prettier --write'],
  '*.{json,md,yml,yaml}': ['prettier --write'],
  'skills/**/SKILL.md': ['node dist/scripts/validate.js'],
};
