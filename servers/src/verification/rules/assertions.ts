import { extractCallInfo, isLiteralNode, type SyntaxNode, walkAst } from '../ast.js';
import type { VerificationCheck } from '../schemas.js';

const ASSERTION_NAMES = new Set([
  'expect',
  'assert',
  'assertThat',
  'assertEquals',
  'assertTrue',
  'assertFalse',
  'assert_true',
  'assert_false',
  'assert_equal',
  'assertEqual',
  'IsTrue',
  'IsFalse',
  'AreEqual',
]);

const ASSERTION_METHODS = new Set([
  'should',
  'and',
  'toBe',
  'toEqual',
  'toStrictEqual',
  'toBeVisible',
  'toHaveText',
  'toBeTrue',
  'toBeFalse',
  'isTrue',
  'isFalse',
  'isEqualTo',
  'isDisplayed',
  'toContain',
  'toHaveTitle',
  'toHaveURL',
  'toHaveCount',
]);

const SUGGESTIONS: Record<string, string> = {
  playwright:
    'Add explicit assertions (e.g. expect(locator).toBeVisible() or expect(locator).toHaveText(...)) to verify expected outcome.',
  cypress:
    "Add explicit assertions (e.g. cy.get(...).should('be.visible') or expect(...)) to verify expected outcome.",
  selenium:
    'Add explicit assertions (e.g. Assert.assertEquals(...) or assertThat(...).isEqualTo(...)) to verify expected outcome.',
  appium:
    'Add explicit assertions (e.g. Assert.assertTrue(...) or assertThat(...).isTrue()) to verify expected outcome.',
  vibium:
    'Add explicit assertions (e.g. await expect(locator).toHaveText(...)) to verify expected outcome.',
};

function hasOnlyLiteralArguments(argsNode: SyntaxNode | null): boolean {
  if (!argsNode) return false;
  const args = argsNode.namedChildren;
  return args.length > 0 && args.every(isLiteralNode);
}

function detectTautology(node: SyntaxNode): string | null {
  const { methodName, objectName, argsNode } = extractCallInfo(node);
  const isAssertion =
    ASSERTION_NAMES.has(methodName) ||
    objectName === 'Assert' ||
    (objectName === 'self' && methodName.startsWith('assert'));

  if (isAssertion && hasOnlyLiteralArguments(argsNode)) {
    return node.text;
  }

  if (ASSERTION_METHODS.has(methodName)) {
    const fnNode = node.childForFieldName('function') ?? node.namedChildren[0];
    const objNode = fnNode?.childForFieldName('object') ?? fnNode?.namedChildren[0];

    if (objNode) {
      const inner = extractCallInfo(objNode);
      if (inner.methodName === 'expect' && hasOnlyLiteralArguments(inner.argsNode)) {
        return node.text;
      }
    }
  }

  return null;
}

function isMeaningfulAssertion(node: SyntaxNode): boolean {
  if (node.type === 'assert_statement') {
    const condition = node.childForFieldName('condition') ?? node.namedChildren[0];
    return Boolean(condition && !isLiteralNode(condition));
  }

  const { methodName, objectName, argsNode } = extractCallInfo(node);
  if (ASSERTION_METHODS.has(methodName)) {
    return detectTautology(node) === null;
  }

  const isAssertion =
    ASSERTION_NAMES.has(methodName) ||
    objectName === 'Assert' ||
    (objectName === 'self' && methodName.startsWith('assert'));

  if (isAssertion) {
    return Boolean(argsNode && !hasOnlyLiteralArguments(argsNode));
  }

  return false;
}

export function checkAssertions(
  code: string,
  framework: string,
  rootNode?: SyntaxNode
): VerificationCheck {
  if (!rootNode) {
    const hasBasic =
      code.includes('expect(') ||
      code.includes('Assert.') ||
      code.includes('assertThat(') ||
      code.includes('.should(') ||
      code.includes('assert ');

    return {
      id: 'meaningful-assertions',
      rule: 'Test scenarios must contain explicit, meaningful business assertions',
      passed: hasBasic,
      severity: 'error',
      suggestion: hasBasic
        ? undefined
        : (SUGGESTIONS[framework] ??
          'Add explicit assertions (e.g. expect(locator).toHaveText(...)) to verify expected outcome.'),
    };
  }

  let hasValid = false;
  let tautology: string | null = null;

  walkAst(rootNode, (node) => {
    if (isMeaningfulAssertion(node)) {
      hasValid = true;
    } else {
      const detected = detectTautology(node);
      if (detected) tautology = detected;
    }
  });

  if (!hasValid && tautology) {
    return {
      id: 'meaningful-assertions',
      rule: 'Test scenarios must contain explicit, meaningful business assertions',
      passed: false,
      severity: 'error',
      evidence: tautology,
      suggestion:
        'Replace tautological dummy assertion with actual element or state validation (e.g. expect(locator).toBeVisible()).',
    };
  }

  return {
    id: 'meaningful-assertions',
    rule: 'Test scenarios must contain explicit, meaningful business assertions',
    passed: hasValid,
    severity: 'error',
    suggestion: hasValid
      ? undefined
      : (SUGGESTIONS[framework] ??
        'Add explicit assertions (e.g. expect(locator).toHaveText(...)) to verify expected outcome.'),
  };
}
