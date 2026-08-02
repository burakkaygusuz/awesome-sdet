import { z } from 'zod';

export const SeleniumByStrategySchema = z
  .enum([
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
  ])
  .describe('Selenium locator strategy type (e.g. "id", "cssSelector", "xpath").');

export const SeleniumExpectedConditionSchema = z
  .enum([
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
  ])
  .describe('Selenium ExpectedCondition function name to evaluate.');

export const SeleniumWaitSchema = z.object({
  targetUrl: z
    .string()
    .max(2048)
    .describe('Target webpage URL where the explicit wait condition applies.'),
  condition: SeleniumExpectedConditionSchema,
  locator: z
    .object({
      by: SeleniumByStrategySchema,
      value: z
        .string()
        .max(512)
        .describe('Locator expression value (e.g. element ID, CSS selector, or XPath string).'),
    })
    .describe('Element location strategy and query expression.'),
  timeoutSeconds: z
    .number()
    .int()
    .min(1)
    .max(120)
    .optional()
    .default(10)
    .describe('Maximum wait duration in seconds before timing out (default: 10s).'),
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
