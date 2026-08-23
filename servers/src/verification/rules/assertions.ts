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

function findExpectCall(
  node: SyntaxNode
): { methodName: string; objectName: string; argsNode: SyntaxNode | null } | null {
  let curr: SyntaxNode | null = node;
  while (curr) {
    const info = extractCallInfo(curr);
    if (info.methodName === 'expect' || info.objectName === 'expect') {
      return info;
    }
    const fnNode: SyntaxNode | null =
      curr.childForFieldName('function') ?? curr.namedChildren[0] ?? null;
    const objNode: SyntaxNode | null =
      fnNode?.childForFieldName('object') ??
      curr.childForFieldName('object') ??
      curr.namedChildren[0] ??
      null;
    if (!objNode || objNode === curr) break;
    curr = objNode;
  }
  return null;
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
      const expectInfo = findExpectCall(objNode);
      if (expectInfo && hasOnlyLiteralArguments(expectInfo.argsNode)) {
        if (hasOnlyLiteralArguments(argsNode) || (argsNode?.namedChildren.length ?? 0) <= 1) {
          return node.text;
        }
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

export function isPageObjectCode(code: string): boolean {
  const isExplicitTestClassOrBlock =
    /\bclass\s+\w*(?:Test|Tests|Spec|Specs|Scenario|TestSuite)\b/i.test(code) ||
    /\b(?:void|async|public|private|protected|def)\s+test\w*\s*\(/.test(code) ||
    /\b(?:test|it|describe)\s*\(/i.test(code) ||
    /@(?:Test|Before|After|ParameterizedTest)\b/.test(code) ||
    /\[Test(?:Case)?\]/.test(code) ||
    /\bexport\s+async\s+function\s+test\w*\s*\(/.test(code);

  if (isExplicitTestClassOrBlock) {
    return false;
  }

  return (
    /\bclass\s+\w*(?:Page|Screen|Component|View|Dialog|Modal|POM)\b/i.test(code) ||
    /\bclass\s+\w+\s*(?:extends\s+\w+\s*)?\{/i.test(code)
  );
}

function checkPageObjectAssertions(hasAssertions: boolean): VerificationCheck {
  return {
    id: 'meaningful-assertions',
    rule: 'Page Objects should model UI elements and interactions without embedded test assertions',
    passed: !hasAssertions,
    severity: 'error',
    evidence: hasAssertions ? 'assertions in Page Object' : undefined,
    suggestion: hasAssertions
      ? 'Remove assertions from Page Object. Keep assertions strictly in test spec files.'
      : undefined,
  };
}

function checkSpecAssertions(
  hasValid: boolean,
  tautology: string | null,
  framework: string
): VerificationCheck {
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

export function checkAssertions(
  code: string,
  framework: string,
  rootNode?: SyntaxNode,
  artifactType?: 'spec' | 'page_object' | 'fixture' | 'helper' | 'auto'
): VerificationCheck {
  const isNonSpec =
    artifactType === 'page_object' ||
    artifactType === 'fixture' ||
    artifactType === 'helper' ||
    (artifactType !== 'spec' && isPageObjectCode(code));

  if (!rootNode) {
    const hasBasic =
      code.includes('expect(') ||
      code.includes('Assert.') ||
      code.includes('assertThat(') ||
      code.includes('.should(') ||
      code.includes('assert ');

    return isNonSpec
      ? checkPageObjectAssertions(hasBasic)
      : checkSpecAssertions(hasBasic, null, framework);
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

  if (isNonSpec) {
    return checkPageObjectAssertions(hasValid || Boolean(tautology));
  }

  return checkSpecAssertions(hasValid, tautology, framework);
}
