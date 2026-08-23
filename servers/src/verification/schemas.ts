import { z } from 'zod';

import { FRAMEWORK_IDS, SUPPORTED_LANGUAGES } from '../registry.js';

export const VERIFICATION_SEVERITIES = ['critical', 'error', 'warning', 'info'] as const;
export type VerificationSeverity = (typeof VERIFICATION_SEVERITIES)[number];

export const ARTIFACT_TYPES = ['spec', 'page_object', 'fixture', 'helper', 'auto'] as const;
export type ArtifactType = (typeof ARTIFACT_TYPES)[number];

export const ArtifactTypeSchema = z
  .enum(ARTIFACT_TYPES)
  .default('auto')
  .describe(
    'Type of test artifact: "spec" (test scenario requiring assertions), "page_object" (Page/Screen Objects where assertions are prohibited), "fixture" (test fixtures/harness), "helper" (API clients/utilities), or "auto" (inferred automatically from AST structure)'
  );

export const VerificationCheckSchema = z.strictObject({
  id: z.string().min(1).describe('Unique machine-readable invariant rule identifier'),
  rule: z.string().min(1).describe('Human-readable description of the invariant rule'),
  passed: z.boolean().describe('Whether the verified code satisfied the invariant rule'),
  severity: z.enum(VERIFICATION_SEVERITIES).describe('Severity level if the rule fails'),
  evidence: z.string().optional().describe('Code snippet or syntax node triggering failure'),
  suggestion: z.string().optional().describe('Actionable remediation guidance for the LLM'),
});

export type VerificationCheck = z.infer<typeof VerificationCheckSchema>;

export const VerificationRequestSchema = z.strictObject({
  code: z.string().min(1).describe('Test artifact source code to verify'),
  framework: z.enum(FRAMEWORK_IDS).describe('Target test automation framework'),
  language: z.enum(SUPPORTED_LANGUAGES).optional().describe('Target programming language'),
  context: z.string().optional().describe('Optional context or scenario description'),
  artifactType: ArtifactTypeSchema,
});

export type VerificationRequest = z.input<typeof VerificationRequestSchema>;
export type ParsedVerificationRequest = z.output<typeof VerificationRequestSchema>;

export const VerificationResultSchema = z.strictObject({
  passed: z.boolean().describe('Whether all mandatory invariant checks passed'),
  complianceScore: z
    .number()
    .int()
    .min(0)
    .max(100)
    .describe('Deterministic compliance score (0-100)'),
  qualityScore: z
    .number()
    .int()
    .min(0)
    .max(100)
    .describe('Holistic code quality score taking length/warnings into account (0-100)'),
  checks: z.array(VerificationCheckSchema).describe('Individual invariant evaluation results'),
  actionableHints: z
    .array(z.string())
    .default([])
    .describe('Actionable repair instructions for LLM bounded self-repair'),
});

export type VerificationResult = z.infer<typeof VerificationResultSchema>;
