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

function unquote(raw: string): string {
  const trimmed = raw.trim();
  const first = trimmed[0];
  const last = trimmed.at(-1);
  if ((first === "'" || first === '"' || first === '`') && first === last && trimmed.length >= 2) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

const BRITTLE_ROOT_XPATH_PATTERN = /^\/(?:\/)?(?:html|body)(?:\/|$)/i;
const BRITTLE_STRUCTURAL_PATTERN = /\/(?:tbody|thead|tfoot)\//i;

function isBrittlePredicate(content: string): boolean {
  const trimmed = content.trim();
  return !(
    trimmed.startsWith('@') ||
    trimmed.includes('=') ||
    trimmed.startsWith('contains(') ||
    trimmed.startsWith('starts-with(') ||
    trimmed.startsWith('normalize-space(') ||
    trimmed.startsWith('text(') ||
    trimmed.startsWith('not(')
  );
}

function hasBrittlePredicate(xpath: string): boolean {
  let start = -1;
  for (let i = 0; i < xpath.length; i++) {
    if (xpath[i] === '[') {
      start = i + 1;
    } else if (xpath[i] === ']' && start !== -1) {
      const pred = xpath.slice(start, i);
      if (isBrittlePredicate(pred)) {
        return true;
      }
      start = -1;
    }
  }
  return false;
}

function stripBrackets(input: string): string {
  let result = '';
  let depth = 0;
  for (const ch of input) {
    if (ch === '[') {
      depth++;
    } else if (ch === ']') {
      depth = Math.max(0, depth - 1);
    } else if (depth === 0) {
      result += ch;
    }
  }
  return result;
}

function sanitizeTemplateString(raw: string): string {
  let result = '';
  let depth = 0;
  for (const ch of raw) {
    if (ch === '{') {
      depth++;
      if (depth === 1) result += 'var';
    } else if (ch === '}') {
      depth = Math.max(0, depth - 1);
    } else if (depth === 0 && ch !== '$') {
      result += ch;
    }
  }
  return result;
}

function isBrittleXpath(raw: string): boolean {
  const clean = unquote(raw).trim();
  if (!clean) return false;

  if (BRITTLE_ROOT_XPATH_PATTERN.test(clean)) {
    return true;
  }

  if (
    !clean.startsWith('//') &&
    !clean.startsWith('.//') &&
    !clean.includes('[') &&
    !clean.includes(':') &&
    !clean.includes('(')
  ) {
    return false;
  }

  const unquoted = clean.replace(/'[^']*'|"[^"]*"/g, "''");

  if (hasBrittlePredicate(unquoted)) {
    return true;
  }

  if (BRITTLE_STRUCTURAL_PATTERN.test(unquoted)) {
    return true;
  }

  if (unquoted.startsWith('//') || unquoted.startsWith('.//')) {
    const structural = stripBrackets(unquoted);
    const parts = structural.split('/').filter(Boolean);
    if (parts.length >= 3) {
      return true;
    }
  }

  return false;
}

const HASHED_CSS_PATTERNS = [/\.css-[a-z0-9]{4,}/i, /\.sc-[a-z0-9]{4,}/i, /\.styled-[a-z0-9]{4,}/i];

function isHashedCss(raw: string): boolean {
  const clean = unquote(raw);
  if (HASHED_CSS_PATTERNS.some((p) => p.test(clean))) {
    return true;
  }
  const pseudoMatches = clean.match(/:nth-child|:nth-of-type/g);
  return (pseudoMatches?.length ?? 0) >= 2;
}

function evaluateStringExpression(node: SyntaxNode): string | null {
  if (node.type === 'string' || node.type === 'string_literal' || node.type === 'template_string') {
    return sanitizeTemplateString(unquote(node.text));
  }

  if (
    node.type === 'binary_expression' ||
    node.type === 'binary_operator' ||
    node.type === 'binary'
  ) {
    const left = node.childForFieldName('left') ?? node.namedChildren[0];
    const right = node.childForFieldName('right') ?? node.namedChildren[1];
    if (left && right) {
      const leftStr = evaluateStringExpression(left) ?? unquote(left.text);
      const rightStr = evaluateStringExpression(right) ?? unquote(right.text);
      return leftStr + rightStr;
    }
  }

  return null;
}

function inspectLocatorNode(node: SyntaxNode): string | null {
  const evalStr = evaluateStringExpression(node);
  if (evalStr && (isHashedCss(evalStr) || isBrittleXpath(evalStr))) {
    return node.text;
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
    const match = inspectLocatorNode(node);
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
