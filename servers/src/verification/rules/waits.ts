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
  Task: new Set(['Delay']),
  page: new Set(['waitForTimeout', 'wait']),
  cy: new Set(['wait']),
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
  _framework: string,
  rootNode?: SyntaxNode
): VerificationCheck {
  if (!rootNode) {
    const hasForbidden =
      code.includes('waitForTimeout(') ||
      code.includes('Thread.sleep(') ||
      code.includes('time.sleep(') ||
      code.includes('setTimeout(');

    return {
      id: 'no-arbitrary-waits',
      rule: 'Synchronize strictly on condition waiters and auto-waiting assertions instead of arbitrary time delays',
      passed: !hasForbidden,
      severity: 'error',
      evidence: hasForbidden ? 'arbitrary delay call' : undefined,
      suggestion: hasForbidden
        ? 'Replace arbitrary sleep with framework-native dynamic condition waiter (e.g. expect(locator).toBeVisible()).'
        : undefined,
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
    suggestion: forbiddenMatch
      ? 'Replace arbitrary sleep with framework-native dynamic condition waiter (e.g. expect(locator).toBeVisible()).'
      : undefined,
  };
}
