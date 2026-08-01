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
  targetUrl: z.string().max(2048),
  condition: SeleniumExpectedConditionSchema,
  locator: z.object({
    by: SeleniumByStrategySchema,
    value: z.string().max(512),
  }),
  timeoutSeconds: z.number().int().min(1).max(120).optional().default(10),
});

export type SeleniumWaitArgs = z.infer<typeof SeleniumWaitSchema>;

export function handleSeleniumWait() {
  return {
    content: [
      {
        type: 'text' as const,
        text: 'Request schema validated; no browser was driven.',
      },
    ],
  };
}
