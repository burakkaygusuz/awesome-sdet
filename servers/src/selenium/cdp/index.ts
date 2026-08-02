import { z } from 'zod';

export const CdpNetworkActionSchema = z
  .enum([
    'mockResponse',
    'blockRequest',
    'failRequest',
    'continueRequest',
    'modifyHeaders',
    'injectBasicAuth',
    'recordTraffic',
  ])
  .describe('CDP network interception action type.');

export const CdpNetworkInterceptionSchema = z.object({
  targetUrl: z
    .string()
    .max(2048)
    .describe('Target webpage URL where CDP session will be attached.'),
  urlPattern: z
    .string()
    .max(1024)
    .describe(
      'URL glob pattern to match network requests for interception (e.g. "*://api.example.com/*").'
    ),
  action: CdpNetworkActionSchema,
  mockStatus: z
    .number()
    .int()
    .min(100)
    .max(599)
    .optional()
    .default(200)
    .describe('HTTP status code to return for mockResponse action (default: 200).'),
  mockResponseBody: z
    .string()
    .max(4096)
    .optional()
    .describe('Mock response payload body text or JSON string for mockResponse action.'),
  headers: z
    .record(z.string().max(256), z.string().max(1024))
    .optional()
    .describe('Custom HTTP headers map to inject into request or response.'),
  authCredentials: z
    .object({
      username: z.string().max(256).describe('Basic HTTP authentication username.'),
      password: z.string().max(256).describe('Basic HTTP authentication password.'),
    })
    .optional()
    .describe('Credentials payload for injectBasicAuth action.'),
  errorReason: z
    .enum(['Failed', 'Aborted', 'AccessDenied', 'ConnectionRefused'])
    .optional()
    .describe('Network failure reason code for failRequest action.'),
});

export type CdpNetworkInterceptionArgs = z.infer<typeof CdpNetworkInterceptionSchema>;

export function handleCdpNetworkInterception() {
  return {
    content: [
      {
        type: 'text' as const,
        text: 'Request schema validated; no CDP session or traffic interception occurred.',
      },
    ],
  };
}
