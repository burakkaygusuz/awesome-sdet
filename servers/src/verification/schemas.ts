import { z } from 'zod';

import { FRAMEWORK_IDS, SUPPORTED_LANGUAGES } from '../registry.js';

export const VERIFICATION_SEVERITIES = ['critical', 'error', 'warning', 'info'] as const;
export type VerificationSeverity = (typeof VERIFICATION_SEVERITIES)[number];

export const VerificationCheckSchema = z.strictObject({
  id: z.string().min(1),
  rule: z.string().min(1),
  passed: z.boolean(),
  severity: z.enum(VERIFICATION_SEVERITIES),
  evidence: z.string().optional(),
  suggestion: z.string().optional(),
});

export type VerificationCheck = z.infer<typeof VerificationCheckSchema>;

export const VerificationRequestSchema = z.strictObject({
  code: z.string().min(1),
  framework: z.enum(FRAMEWORK_IDS),
  language: z.enum(SUPPORTED_LANGUAGES).optional(),
  context: z.string().optional(),
});

export type VerificationRequest = z.infer<typeof VerificationRequestSchema>;

export const VerificationResultSchema = z.strictObject({
  passed: z.boolean(),
  score: z.number().int().min(0).max(100),
  complianceScore: z.number().int().min(0).max(100),
  qualityScore: z.number().int().min(0).max(100),
  checks: z.array(VerificationCheckSchema),
  actionableHints: z.array(z.string()).default([]),
});

export type VerificationResult = z.infer<typeof VerificationResultSchema>;
