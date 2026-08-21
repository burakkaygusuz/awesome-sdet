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
      title: 'Deterministic Test Invariant Scanner',
      description:
        'Scans generated or migrated test code for flakiness, missing assertions, and anti-patterns.',
      inputSchema: VerificationRequestSchema,
      outputSchema: VerificationResultSchema,
      annotations: SAFE_READONLY_ANNOTATIONS,
    },
    safeToolHandler(async (args) => {
      const result = await verifyTestArtifact(args);
      const formattedHints = result.actionableHints.map((h) => '- ' + h).join('\n');
      const summaryText = result.passed
        ? `✅ Test artifact verification PASSED (Compliance: ${result.complianceScore}/100, Quality: ${result.qualityScore}/100)`
        : `❌ Test artifact verification FAILED (Compliance: ${result.complianceScore}/100, Quality: ${result.qualityScore}/100)\n\nActionable Hints:\n${formattedHints}`;

      return {
        content: [{ type: 'text', text: summaryText }],
        structuredContent: result,
      };
    })
  );
}
