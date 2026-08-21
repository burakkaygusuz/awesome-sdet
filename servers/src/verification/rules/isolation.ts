import { type SyntaxNode, walkAst } from '../ast.js';
import type { VerificationCheck } from '../schemas.js';

const DRIVER_TYPE_NAMES = new Set([
  'WebDriver',
  'RemoteWebDriver',
  'ChromeDriver',
  'FirefoxDriver',
  'EdgeDriver',
  'SafariDriver',
  'AppiumDriver',
  'AndroidDriver',
  'IOSDriver',
  'Page',
  'IWebDriver',
  'BrowserContext',
]);

const DRIVER_VARIABLE_NAMES = new Set(['page', 'driver', 'browser', 'context']);

const SUGGESTIONS: Record<string, string> = {
  selenium:
    'Use ThreadLocal<WebDriver> or per-test driver instantiation to prevent shared mutable state in parallel runs.',
  appium:
    'Use ThreadLocal<AppiumDriver> or per-test driver instantiation to prevent shared mutable state in parallel runs.',
  playwright:
    'Use test fixture-scoped page/context ({ page }) instead of static or global page instances.',
  cypress:
    'Use beforeEach lifecycle hooks or isolated cy.session() instead of global mutable test state.',
  vibium: 'Use test-scoped session instances instead of global mutable state.',
};

function detectTopLevelVariable(rootNode: SyntaxNode): string | null {
  for (const child of rootNode.namedChildren) {
    const isVarDecl =
      child.type === 'lexical_declaration' ||
      child.type === 'variable_declaration' ||
      child.type === 'variable_statement';
    if (!isVarDecl) continue;

    for (const declarator of child.namedChildren) {
      const idNode = declarator.childForFieldName('name') ?? declarator.namedChildren[0];
      if (idNode && DRIVER_VARIABLE_NAMES.has(idNode.text)) {
        return child.text;
      }
    }
  }
  return null;
}

function hasStaticModifier(node: SyntaxNode): boolean {
  return (
    node.children.some((c: SyntaxNode) => c.type === 'modifiers' && c.text.includes('static')) ||
    node.children.some((c: SyntaxNode) => c.type === 'static' || c.text === 'static') ||
    node.text.startsWith('static ') ||
    node.text.includes('static ')
  );
}

function detectUnsafeStaticField(node: SyntaxNode): string | null {
  const isField =
    node.type === 'field_declaration' ||
    node.type === 'property_declaration' ||
    node.type === 'property_definition' ||
    node.type === 'public_field_definition';
  if (!isField) return null;

  if (!hasStaticModifier(node) || node.text.includes('ThreadLocal')) {
    return null;
  }

  const typeText = node.childForFieldName('type')?.text ?? '';
  if (
    DRIVER_TYPE_NAMES.has(typeText) ||
    node.text.includes('WebDriver') ||
    node.text.includes('Driver') ||
    node.text.includes('page')
  ) {
    return node.text;
  }
  return null;
}

function detectGlobalAssignment(node: SyntaxNode): string | null {
  if (node.type === 'global_statement' && node.text.includes('driver')) {
    return node.text;
  }

  if (node.type === 'assignment_expression') {
    const left = node.childForFieldName('left');
    if (
      left &&
      (left.text.startsWith('global.') ||
        left.text.startsWith('globalThis.') ||
        left.text.startsWith('window.'))
    ) {
      const propName = left.text.split('.')[1] ?? '';
      if (DRIVER_VARIABLE_NAMES.has(propName)) {
        return node.text;
      }
    }
  }

  return null;
}

export function checkStateIsolation(
  code: string,
  framework: string,
  rootNode?: SyntaxNode
): VerificationCheck {
  if (!rootNode) {
    const hasStatic = code.includes('static WebDriver') || code.includes('global driver');
    return {
      id: 'thread-isolated-state',
      rule: 'Driver and session instances must be thread-isolated to guarantee concurrency safety',
      passed: !hasStatic,
      severity: 'error',
      evidence: hasStatic ? 'static or global driver' : undefined,
      suggestion: hasStatic
        ? (SUGGESTIONS[framework] ??
          'Use ThreadLocal<WebDriver>, fixture-scoped page/driver, or per-test driver instantiation to prevent shared mutable state in parallel runs.')
        : undefined,
    };
  }

  let evidence = detectTopLevelVariable(rootNode);

  if (!evidence) {
    walkAst(rootNode, (node) => {
      const staticField = detectUnsafeStaticField(node);
      if (staticField) {
        evidence = staticField;
        return false;
      }
      const globalAssign = detectGlobalAssignment(node);
      if (globalAssign) {
        evidence = globalAssign;
        return false;
      }
    });
  }

  return {
    id: 'thread-isolated-state',
    rule: 'Driver and session instances must be thread-isolated to guarantee concurrency safety',
    passed: !evidence,
    severity: 'error',
    evidence: evidence ? evidence.trim() : undefined,
    suggestion: evidence
      ? (SUGGESTIONS[framework] ??
        'Use ThreadLocal<WebDriver>, fixture-scoped page/driver, or per-test driver instantiation to prevent shared mutable state in parallel runs.')
      : undefined,
  };
}
