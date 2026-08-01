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
  targetUrl: z.string(),
  urlPattern: z.string(),
  action: CdpNetworkActionSchema,
  mockStatus: z.number().optional().default(200),
  mockResponseBody: z.string().optional(),
  headers: z.record(z.string(), z.string()).optional(),
  authCredentials: z
    .object({
      username: z.string(),
      password: z.string(),
    })
    .optional(),
  errorReason: z.enum(['Failed', 'Aborted', 'AccessDenied', 'ConnectionRefused']).optional(),
});

export type CdpNetworkInterceptionArgs = z.infer<typeof CdpNetworkInterceptionSchema>;

export function handleCdpNetworkInterception(args: CdpNetworkInterceptionArgs) {
  const {
    targetUrl,
    urlPattern,
    action,
    mockStatus = 200,
    mockResponseBody,
    authCredentials,
    errorReason,
  } = args;

  let extraDetails = '';
  if (action === 'injectBasicAuth' && authCredentials) {
    extraDetails = ` with username '${authCredentials.username}'`;
  } else if (action === 'failRequest' && errorReason) {
    extraDetails = ` with error reason '${errorReason}'`;
  } else if (mockResponseBody) {
    extraDetails = ` with mock status ${mockStatus} and custom body`;
  }

  return {
    content: [
      {
        type: 'text' as const,
        text: `[MCP 2026-07-28 Stateless Core] CDP Network interception rule '${action}' configured for pattern '${urlPattern}' on URL '${targetUrl}'${extraDetails}.`,
      },
    ],
  };
}
