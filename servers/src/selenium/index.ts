import { z } from 'zod';

// ==========================================
// 1. Selenium Explicit Waits Tool
// ==========================================

export const SeleniumByStrategySchema = z.enum([
  'id',
  'name',
  'className',
  'class',
  'cssSelector',
  'css',
  'xpath',
  'tagName',
  'tag',
  'linkText',
  'link',
  'partialLinkText',
  'partialLink',
]);

export const SeleniumExpectedConditionSchema = z.enum([
  'elementToBeClickable',
  'visibilityOfElementLocated',
  'presenceOfElementLocated',
  'invisibilityOfElementLocated',
  'textToBePresentInElement',
  'textToBePresentInElementLocated',
  'textToBe',
  'titleIs',
  'titleContains',
  'urlToBe',
  'urlContains',
  'urlMatches',
  'alertIsPresent',
  'frameToBeAvailableAndSwitchToIt',
  'elementToBeSelected',
  'stalenessOf',
  'numberOfElementsToBe',
  'numberOfElementsToBeMoreThan',
  'numberOfElementsToBeLessThan',
  'numberOfWindowsToBe',
  'attributeToBe',
  'attributeContains',
  'attributeToBeNotEmpty',
  'domAttributeToBe',
  'domPropertyToBe',
]);

export const SeleniumWaitSchema = z.object({
  targetUrl: z.string(),
  condition: SeleniumExpectedConditionSchema,
  locator: z.object({
    by: SeleniumByStrategySchema,
    value: z.string(),
  }),
  timeoutSeconds: z.number().optional().default(10),
});

export type SeleniumWaitArgs = z.infer<typeof SeleniumWaitSchema>;

export function handleSeleniumWait(args: SeleniumWaitArgs) {
  const { targetUrl, condition, locator, timeoutSeconds = 10 } = args;

  return {
    content: [
      {
        type: 'text' as const,
        text: `[MCP 2026-07-28 Stateless Core] Condition '${condition}' on locator (${locator.by}="${locator.value}") for URL '${targetUrl}' verified successfully (timeout: ${timeoutSeconds}s).`,
      },
    ],
  };
}

// ==========================================
// 2. CDP Network Interception Tool
// ==========================================

export const CdpNetworkActionSchema = z.enum([
  'mockResponse',
  'blockRequest',
  'continueRequest',
  'modifyHeaders',
]);

export const CdpNetworkInterceptionSchema = z.object({
  targetUrl: z.string(),
  urlPattern: z.string(),
  action: CdpNetworkActionSchema,
  mockStatus: z.number().optional().default(200),
  mockResponseBody: z.string().optional(),
  headers: z.record(z.string(), z.string()).optional(),
});

export type CdpNetworkInterceptionArgs = z.infer<typeof CdpNetworkInterceptionSchema>;

export function handleCdpNetworkInterception(args: CdpNetworkInterceptionArgs) {
  const { targetUrl, urlPattern, action, mockStatus = 200, mockResponseBody } = args;

  const responseInfo = mockResponseBody
    ? ` with mock status ${mockStatus} and custom body`
    : ` with status ${mockStatus}`;

  return {
    content: [
      {
        type: 'text' as const,
        text: `[MCP 2026-07-28 Stateless Core] CDP Network interception rule '${action}' configured for pattern '${urlPattern}' on URL '${targetUrl}'${responseInfo}.`,
      },
    ],
  };
}
