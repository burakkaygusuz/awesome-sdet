import { z } from 'zod';

export const CdpNetworkActionSchema = z.enum([
  'mockResponse',
  'blockRequest',
  'failRequest',
  'continueRequest',
  'modifyHeaders',
  'injectBasicAuth',
  'recordTraffic',
]);

export const CdpNetworkInterceptionSchema = z.object({
  targetUrl: z.string().max(2048),
  urlPattern: z.string().max(1024),
  action: CdpNetworkActionSchema,
  mockStatus: z.number().int().min(100).max(599).optional().default(200),
  mockResponseBody: z.string().max(4096).optional(),
  headers: z.record(z.string().max(256), z.string().max(1024)).optional(),
  authCredentials: z
    .object({
      username: z.string().max(256),
      password: z.string().max(256),
    })
    .optional(),
  errorReason: z.enum(['Failed', 'Aborted', 'AccessDenied', 'ConnectionRefused']).optional(),
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
