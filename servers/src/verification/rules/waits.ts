import { extractCallInfo, type SyntaxNode, walkAst } from '../ast.js';
import type { VerificationCheck } from '../schemas.js';

const FORBIDDEN_FUNCTION_NAMES = new Set([
  'setTimeout',
  'setInterval',
  'sleep',
  'waitForTimeout',
  'Delay',
]);

const FORBIDDEN_OBJECT_METHODS: Record<string, Set<string>> = {
  Thread: new Set(['sleep', 'Sleep']),
  time: new Set(['sleep']),
  asyncio: new Set(['sleep']),
  TimeUnit: new Set(['sleep']),
  Task: new Set(['Delay', 'delay']),
  page: new Set(['waitForTimeout', 'wait']),
  cy: new Set(['wait']),
};

const SUGGESTIONS: Record<string, string> = {
  playwright:
    'Replace arbitrary sleep with framework-native dynamic condition waiter (e.g. expect(locator).toBeVisible()).',
  cypress:
    'Replace arbitrary sleep with framework-native dynamic condition waiter (e.g. cy.wait("@alias") or .should("be.visible")).',
  selenium:
    'Replace arbitrary sleep with framework-native dynamic condition waiter (e.g. WebDriverWait and ExpectedConditions).',
  appium:
    'Replace arbitrary sleep with framework-native dynamic condition waiter (e.g. WebDriverWait or dynamic polling).',
  vibium:
    'Replace arbitrary sleep with framework-native dynamic condition waiter (e.g. auto-waiting actions or condition assertions).',
};

function isRouteAlias(firstArg?: SyntaxNode): boolean {
  if (!firstArg) return false;
  const isString = firstArg.type === 'string' || firstArg.type === 'string_literal';
  return Boolean(isString && (firstArg.text.startsWith('"@') || firstArg.text.startsWith("'@")));
}

function detectForbiddenWait(node: SyntaxNode): string | null {
  const { methodName, objectName, argsNode } = extractCallInfo(node);

  if (FORBIDDEN_FUNCTION_NAMES.has(methodName)) {
    return node.text;
  }

  const forbiddenMethods = FORBIDDEN_OBJECT_METHODS[objectName];
  if (!forbiddenMethods?.has(methodName)) {
    return null;
  }

  if (objectName === 'cy' && methodName === 'wait') {
    const firstArg = argsNode?.namedChildren[0];
    return isRouteAlias(firstArg) ? null : node.text;
  }

  return node.text;
}

export function checkArbitraryWaits(
  code: string,
  framework: string,
  rootNode?: SyntaxNode
): VerificationCheck {
  const defaultSuggestion =
    SUGGESTIONS[framework] ??
    'Replace arbitrary sleep with framework-native dynamic condition waiter (e.g. expect(locator).toBeVisible()).';

  if (!rootNode) {
    const hasForbidden =
      code.includes('waitForTimeout(') ||
      code.includes('Thread.sleep(') ||
      code.includes('time.sleep(') ||
      code.includes('asyncio.sleep(') ||
      code.includes('Task.Delay(') ||
      code.includes('setTimeout(');

    return {
      id: 'no-arbitrary-waits',
      rule: 'Synchronize strictly on condition waiters and auto-waiting assertions instead of arbitrary time delays',
      passed: !hasForbidden,
      severity: 'error',
      evidence: hasForbidden ? 'arbitrary delay call' : undefined,
      suggestion: hasForbidden ? defaultSuggestion : undefined,
    };
  }

  let forbiddenMatch: string | null = null;

  walkAst(rootNode, (node) => {
    const match = detectForbiddenWait(node);
    if (match) {
      forbiddenMatch = match;
      return false;
    }
  });

  return {
    id: 'no-arbitrary-waits',
    rule: 'Synchronize strictly on condition waiters and auto-waiting assertions instead of arbitrary time delays',
    passed: !forbiddenMatch,
    severity: 'error',
    evidence: forbiddenMatch ?? undefined,
    suggestion: forbiddenMatch ? defaultSuggestion : undefined,
  };
}
