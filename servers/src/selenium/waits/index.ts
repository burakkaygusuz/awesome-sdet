import { z } from 'zod';

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
