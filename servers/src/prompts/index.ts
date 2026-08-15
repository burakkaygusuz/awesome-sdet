import { McpServer } from '@modelcontextprotocol/server';
import { z } from 'zod';

export const SupportedFrameworkSchema = z
  .enum(['selenium', 'cypress', 'vibium', 'appium', 'playwright'] as const)
  .describe(
    'Target test automation framework: "selenium", "cypress", "vibium", "appium", or "playwright"'
  );

export type SupportedFramework = z.infer<typeof SupportedFrameworkSchema>;

export const SupportedLanguageSchema = z
  .enum(['typescript', 'javascript', 'python', 'java', 'csharp', 'ruby'] as const)
  .describe(
    'Programming language: "typescript", "javascript", "python", "java", "csharp", or "ruby"'
  );

export type SupportedLanguage = z.infer<typeof SupportedLanguageSchema>;

export function registerPrompts(server: McpServer): void {
  server.registerPrompt(
    'generate-test',
    {
      title: 'Generate Test Suite',
      description:
        'Generates a production-grade, resilient test suite for a target framework and language',
      argsSchema: z.object({
        framework: SupportedFrameworkSchema,
        language: SupportedLanguageSchema,
        featureDescription: z
          .string()
          .min(5)
          .describe('Detailed description of the user journey, assertions, and test expectations'),
      }),
    },
    ({ framework, language, featureDescription }) => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `You are an enterprise SDET Specialist. Generate a production-grade, resilient test suite for ${framework} using ${language}.

Reference Guidelines:
- Consult canonical capability skills (\`skills/sdet-*\`), framework adapter references (\`skills/sdet-*/references/${framework}.md\`), and MCP knowledge tools (\`read_${framework}_*_docs\`).
- Reference canonical invariants at \`sdet://guidelines\` and API references at \`${framework}://{domain}/${language}\`.

Feature Specifications:
${featureDescription}

Core Quality Invariants:
1. Locator Strategy: Use semantic/data-test attributes (roles, labels, test IDs). Avoid brittle structural CSS or XPath.
2. Dynamic Synchronization: Rely strictly on dynamic condition polling — NEVER use hardcoded arbitrary sleep intervals.
3. Modular Architecture: Structure reusable interactions using Page Object Models or Action patterns.
4. Concurrency & Isolation: Ensure thread-safety, statelessness, and clean session/storage isolation.`,
          },
        },
      ],
    })
  );

  server.registerPrompt(
    'migrate-test',
    {
      title: 'Migrate Test Suite',
      description:
        'Translates test suites between automation frameworks while eliminating anti-patterns',
      argsSchema: z.object({
        sourceFramework: SupportedFrameworkSchema.describe(
          'Source framework (selenium, cypress, vibium, appium, playwright)'
        ),
        targetFramework: SupportedFrameworkSchema.describe(
          'Target framework to migrate to (selenium, cypress, vibium, appium, playwright)'
        ),
        sourceCode: z.string().min(5).describe('Source test code to translate'),
      }),
    },
    ({ sourceFramework, targetFramework, sourceCode }) => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Migrate the following test code from ${sourceFramework} to ${targetFramework}.

Migration Rules:
1. Target Idioms: Consult canonical capability skills (\`skills/sdet-*\`) and target framework adapter references (\`skills/sdet-*/references/${targetFramework}.md\`), adopting idiomatic ${targetFramework} patterns.
2. Anti-Pattern Elimination: Refactor any hardcoded sleeps, brittle XPaths, or shared state into ${targetFramework} explicit condition waits and semantic locators.
3. Assertion Fidelity: Preserve all business logic, assertions, and state verification.

Source Test Code (${sourceFramework}):
\`\`\`
${sourceCode}
\`\`\``,
          },
        },
      ],
    })
  );

  server.registerPrompt(
    'diagnose-flakiness',
    {
      title: 'Diagnose Test Flakiness',
      description:
        'Performs systematic root-cause analysis and provides deterministic fixes for flaky tests',
      argsSchema: z.object({
        framework: SupportedFrameworkSchema.describe(
          'Testing framework where failure occurred (selenium, cypress, vibium, appium, playwright)'
        ),
        failureLog: z.string().min(5).describe('Stack trace, console error, or CI log'),
        testCode: z.string().min(5).describe('Failing test source code'),
      }),
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

Follow the Systematic Diagnostic Workflow:
1. Phase 1 - Trace: Identify the exact point of divergence (DOM attachment state, animation race condition, network request latency).
2. Phase 2 - Hypothesize: Formulate the single root-cause hypothesis explaining why the assertion or interaction failed.
3. Phase 3 - Prescribe: Formulate the deterministic fix using ${framework} explicit condition polling, resilient locators, or network mocking without arbitrary sleeps.`,
          },
        },
      ],
    })
  );
}
