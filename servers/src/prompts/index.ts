import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

export function registerPrompts(server: McpServer): void {
  // Prompt 1: Generate Test
  server.prompt(
    'generate-test',
    {
      framework: z
        .string()
        .describe('Target test automation framework (e.g., selenium, cypress, playwright)'),
      language: z
        .string()
        .describe('Programming language (e.g., typescript, python, java, csharp)'),
      featureDescription: z
        .string()
        .describe('Description of the user journey, assertions, and test expectations'),
    },
    ({ framework, language, featureDescription }) => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `You are an enterprise SDET Specialist. Generate a production-grade, resilient test suite for ${framework} using ${language}.

Feature Specifications:
${featureDescription}

Core Quality Invariants:
1. Use semantic/data-test attributes for element queries.
2. Rely strictly on dynamic condition polling — NO hardcoded arbitrary sleep intervals.
3. Structure reusable interactions using Page Object Models or Action patterns.
4. Ensure thread-safety and session isolation.`,
          },
        },
      ],
    })
  );

  // Prompt 2: Migrate Test
  server.prompt(
    'migrate-test',
    {
      sourceFramework: z.string().describe('Source framework (e.g., selenium, cypress)'),
      targetFramework: z.string().describe('Target framework to migrate to'),
      sourceCode: z.string().describe('Source test code to translate'),
    },
    ({ sourceFramework, targetFramework, sourceCode }) => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Migrate the following test code from ${sourceFramework} to ${targetFramework}. Preserve all test assertions, dynamic synchronization mechanics, and business logic while adopting target framework idiomatic primitives:

\`\`\`
${sourceCode}
\`\`\``,
          },
        },
      ],
    })
  );

  // Prompt 3: Diagnose Flakiness
  server.prompt(
    'diagnose-flakiness',
    {
      framework: z.string().describe('Testing framework where failure occurred'),
      failureLog: z.string().describe('Stack trace, console error, or CI log'),
      testCode: z.string().describe('Failing test source code'),
    },
    ({ framework, failureLog, testCode }) => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Perform a systematic root-cause investigation for the following flaky test failure in ${framework}:

Failure Log:
${failureLog}

Test Code:
${testCode}

Analyze:
1. Race conditions, animation timing, and DOM attachment states.
2. Network request timing vs assertion sequencing.
3. Solution: Replace with explicit condition polling and resilient locator hierarchy.`,
          },
        },
      ],
    })
  );
}
