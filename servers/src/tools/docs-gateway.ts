import { z } from 'zod';
import { FRAMEWORK_IDS, SUPPORTED_LANGUAGES } from '../registry.js';

export const DocsGatewayInputSchema = z.strictObject({
  framework: z.enum(FRAMEWORK_IDS).describe('Target test automation framework'),
  domain: z
    .string()
    .min(1)
    .describe('Capability domain (e.g. locators, actions, network, storage, bidi)'),
  language: z.enum(SUPPORTED_LANGUAGES).optional().describe('Target programming language'),
  query: z
    .string()
    .optional()
    .describe('Optional search query or heading filter to prevent token bloat'),
});

export type DocsGatewayInput = z.infer<typeof DocsGatewayInputSchema>;
