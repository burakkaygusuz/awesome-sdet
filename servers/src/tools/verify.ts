import type { McpServer } from '@modelcontextprotocol/server';
import { SAFE_READONLY_ANNOTATIONS } from '../domains/shared.js';
import { safeToolHandler } from '../server.js';
import {
  VerificationRequestSchema,
  VerificationResultSchema,
  verifyTestArtifact,
} from '../verification/index.js';

export function registerVerifyTool(server: McpServer): void {
  server.registerTool(
    'verify_test_artifact',
    {
      title: 'Deterministic Test Artifact Verifier',
      description:
        'Analyzes generated or migrated test code for flakiness, missing assertions, and anti-patterns.',
      inputSchema: VerificationRequestSchema,
      outputSchema: VerificationResultSchema,
      annotations: SAFE_READONLY_ANNOTATIONS,
    },
    safeToolHandler(async (args) => {
      const result = await verifyTestArtifact(args);
      const summaryText = result.passed
        ? `✅ Test artifact verification PASSED (Score: ${result.score}/100)`
        : `❌ Test artifact verification FAILED (Score: ${result.score}/100)\n\nActionable Hints:\n${result.actionableHints.map((h) => `- ${h}`).join('\n')}`;

      return {
        content: [{ type: 'text', text: summaryText }],
        structuredContent: result,
      };
    })
  );
}
