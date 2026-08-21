import { type SyntaxNode, walkAst } from '../ast.js';
import type { VerificationCheck } from '../schemas.js';

const SUGGESTIONS: Record<string, string> = {
  playwright:
    'Replace brittle XPath/DOM index paths with accessible locators (e.g. getByRole, getByLabel, getByText, or getByTestId).',
  cypress:
    'Replace brittle XPath/DOM index paths with accessible locators (e.g. cy.findByRole or cy.get("[data-testid=...]")).',
  selenium:
    'Replace brittle XPath/DOM index paths with semantic locators (e.g. By.id, By.name, or By.cssSelector("[data-testid=...]")).',
  appium:
    'Replace brittle XPath/DOM index paths with accessible locators (e.g. AppiumBy.accessibilityId or semantic selectors).',
  vibium:
    'Replace brittle XPath/DOM index paths with accessible semantic locators (e.g. vibium.findByRole or semantic selectors).',
};

function isBrittleXpath(raw: string): boolean {
  const clean = raw.replace(/^['"`]|['"`]$/g, '').trim();
  if (
    clean.startsWith('//html') ||
    clean.startsWith('/html') ||
    clean.startsWith('//body') ||
    clean.startsWith('/body')
  ) {
    return true;
  }
  if (clean.startsWith('//') || clean.startsWith('/')) {
    const parts = clean.split('/').filter(Boolean);
    return parts.length >= 3 || parts.some((p) => p.includes('[') && p.includes(']'));
  }
  return false;
}

function isHashedCss(raw: string): boolean {
  const clean = raw.replace(/^['"`]|['"`]$/g, '').trim();
  if (clean.includes('.css-') || clean.includes('.sc-') || clean.includes('.styled-')) {
    return true;
  }
  if (clean.includes('__') && clean.includes('_')) {
    return true;
  }
  return clean.split(':nth-child').length > 2 || clean.split(':nth-of-type').length > 2;
}

function inspectStringNode(node: SyntaxNode): string | null {
  const isString =
    node.type === 'string' || node.type === 'string_literal' || node.type === 'template_string';
  if (!isString) return null;

  const text = node.text;
  if (isHashedCss(text) || isBrittleXpath(text)) {
    return text;
  }
  return null;
}

export function checkLocators(
  code: string,
  framework: string,
  rootNode?: SyntaxNode
): VerificationCheck {
  if (!rootNode) {
    const isBrittle = isBrittleXpath(code) || isHashedCss(code);
    return {
      id: 'resilient-accessibility-locators',
      rule: 'Anchor element targets to accessible semantics (role, label, test ID) rather than brittle DOM paths',
      passed: !isBrittle,
      severity: 'error',
      evidence: isBrittle ? 'brittle locator string' : undefined,
      suggestion: isBrittle
        ? (SUGGESTIONS[framework] ??
          'Replace brittle XPath/DOM index paths with accessible locators (e.g. getByRole, getByLabel, or By.name).')
        : undefined,
    };
  }

  let evidence: string | null = null;

  walkAst(rootNode, (node) => {
    const match = inspectStringNode(node);
    if (match) {
      evidence = match;
      return false;
    }
  });

  return {
    id: 'resilient-accessibility-locators',
    rule: 'Anchor element targets to accessible semantics (role, label, test ID) rather than brittle DOM paths',
    passed: !evidence,
    severity: 'error',
    evidence: evidence ?? undefined,
    suggestion: evidence
      ? (SUGGESTIONS[framework] ??
        'Replace brittle XPath/DOM index paths with accessible locators (e.g. getByRole, getByLabel, or By.name).')
      : undefined,
  };
}
