export default {
  '*.{ts,js,mjs}': ['eslint --fix', 'prettier --write'],
  '*.{json,md,yml,yaml}': ['prettier --write'],
  '{skills/**/SKILL.md,servers/src/domains/**/references/*.md,agents/**/*.agent.md,plugin.json,mcp.json}':
    ['node dist/scripts/validate.js'],
};
