import { z } from 'zod';
import { SupportedLanguageSchema, SupportedLanguage, loadReferenceMarkdown } from '../common.js';

export const AppiumLocatorStrategySchema = z
  .enum([
    'accessibility_id',
    'ios_class_chain',
    'ios_predicate_string',
    'android_uiautomator',
    'id',
    'xpath',
  ] as const)
  .describe('Appium mobile locator strategy to inspect.');

export type AppiumLocatorStrategy = z.infer<typeof AppiumLocatorStrategySchema>;

export const AppiumLocatorsDocsSchema = z
  .object({
    strategy: AppiumLocatorStrategySchema.optional().describe(
      'Specific mobile locator strategy to query (e.g. "accessibility_id", "ios_class_chain", "android_uiautomator"). Omit for complete guide.'
    ),
    language: SupportedLanguageSchema,
  })
  .strict();

export type AppiumLocatorsDocsArgs = z.infer<typeof AppiumLocatorsDocsSchema>;

export const APPIUM_LOCATOR_HIERARCHY_MARKDOWN = `## Mobile Locator Strategy Hierarchy & Best Practices

| Strategy | Priority / Speed | Platform | Best Practice & Performance Rationale |
| :--- | :--- | :--- | :--- |
| **\`accessibility_id\`** | 🥇 #1 (Cross-Platform Gold Standard) | iOS & Android | Primary selector (content-desc on Android, accessibilityIdentifier / label on iOS). Extremely fast and resilient. |
| **\`ios_class_chain\`** | 🥈 #2 (iOS Fast Direct Hierarchical) | iOS (XCUITest) | Native XCUITest tree query (**/XCUIElementTypeButton[\`name == 'Submit'\`]). Much faster than XPath on iOS. |
| **\`ios_predicate_string\`** | 🥈 #2 (iOS Fast Predicate Expression) | iOS (XCUITest) | Native NSPredicate query (label == 'Login' AND visible == 1). Instant execution directly in WebDriverAgent. |
| **\`android_uiautomator\`** | 🥈 #2 (Android Native Engine Query) | Android (UiAutomator2) | Native Android UiSelector query (new UiSelector().text('Login').className('android.widget.Button')) or UiScrollable. |
| **\`id\`** | 🥉 #3 (Native Resource-ID) | Android / iOS | Android package:id/view_id or iOS identifier. Stable for native components. |
| **\`xpath\`** | 🏅 #4 (Fallback Only - Slow) | iOS & Android | ⚠️ Avoid deep absolute XPaths. Recursively parses massive accessibility XML trees; causes severe latency. |`;

const FULL_HEADER = `# API Reference — Appium Mobile Locator Strategies & Selectors (Appium 3.6.0+)`;

export async function handleAppiumLocatorsDocs(args: AppiumLocatorsDocsArgs) {
  const targetLanguage: SupportedLanguage = args.language;
  const langCodeExamples = await loadReferenceMarkdown(import.meta.url, targetLanguage);
  const combinedMarkdown = `${FULL_HEADER}\n\n${APPIUM_LOCATOR_HIERARCHY_MARKDOWN}\n\n---\n\n${langCodeExamples}`;

  if (args?.strategy) {
    const strategyName = args.strategy;
    const lines = APPIUM_LOCATOR_HIERARCHY_MARKDOWN.split('\n');
    const matchingLines = lines.filter((line) =>
      line.toLowerCase().includes(`**\`${strategyName.toLowerCase()}\`**`)
    );

    const text =
      matchingLines.length > 0
        ? `${FULL_HEADER} (${strategyName})\n\n${matchingLines.join('\n')}\n\n---\n\n${combinedMarkdown}`
        : combinedMarkdown;

    return {
      content: [
        {
          type: 'text' as const,
          text,
        },
      ],
    };
  }

  return {
    content: [
      {
        type: 'text' as const,
        text: combinedMarkdown,
      },
    ],
  };
}
