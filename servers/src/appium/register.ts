import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ToolAnnotations } from '@modelcontextprotocol/sdk/types.js';
import type { safeToolHandler } from '../server.js';
import {
  handleAppiumCapabilitiesDocs,
  handleAppiumLocatorsDocs,
  handleAppiumGesturesDocs,
  handleAppiumContextDocs,
  handleAppiumDeviceDocs,
  AppiumCapabilitiesDocsSchema,
  AppiumLocatorsDocsSchema,
  AppiumGesturesDocsSchema,
  AppiumContextDocsSchema,
  AppiumDeviceDocsSchema,
} from './index.js';

export function registerAppiumTools(
  server: McpServer,
  safeHandler: typeof safeToolHandler,
  annotations: ToolAnnotations
): void {
  server.registerTool(
    'read_appium_capabilities_docs',
    {
      title: 'Appium Driver & Capabilities Docs',
      description:
        'Returns Appium 3.6.0+ modular driver options, W3C capabilities (UiAutomator2, XCUITest), and setup guides.',
      inputSchema: AppiumCapabilitiesDocsSchema,
      annotations,
    },
    safeHandler((args) => handleAppiumCapabilitiesDocs(args))
  );

  server.registerTool(
    'read_appium_locators_docs',
    {
      title: 'Appium Locator Strategies & Selectors',
      description:
        'Returns mobile locator hierarchy, Accessibility ID, iOS Class Chain, iOS Predicates, and UiAutomator selectors.',
      inputSchema: AppiumLocatorsDocsSchema,
      annotations,
    },
    safeHandler((args) => handleAppiumLocatorsDocs(args))
  );

  server.registerTool(
    'read_appium_gestures_docs',
    {
      title: 'Appium W3C Actions & Mobile Gestures',
      description:
        'Returns W3C Actions PointerInput touch gestures (tap, swipe, scroll, drag-drop, pinch) and mobile extensions.',
      inputSchema: AppiumGesturesDocsSchema,
      annotations,
    },
    safeHandler((args) => handleAppiumGesturesDocs(args))
  );

  server.registerTool(
    'read_appium_context_docs',
    {
      title: 'Appium Hybrid Context Switching Docs',
      description:
        'Returns Native App vs. WebView context switching, Chromedriver automation, and Safari view controller reference.',
      inputSchema: AppiumContextDocsSchema,
      annotations,
    },
    safeHandler((args) => handleAppiumContextDocs(args))
  );

  server.registerTool(
    'read_appium_device_docs',
    {
      title: 'Appium Device & App Lifecycle Docs',
      description:
        'Returns App lifecycle commands (install, activate, terminate), clipboard, keyboard, and device orientation.',
      inputSchema: AppiumDeviceDocsSchema,
      annotations,
    },
    safeHandler((args) => handleAppiumDeviceDocs(args))
  );
}
