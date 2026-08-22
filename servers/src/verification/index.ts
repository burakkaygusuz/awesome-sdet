import { getTreeSitterParser, parseAst } from './ast.js';
import {
  checkArbitraryWaits,
  checkAssertions,
  checkLocators,
  checkStateIsolation,
} from './rules/index.js';
import {
  type VerificationCheck,
  type VerificationResult,
  VerificationRequestSchema,
  VerificationResultSchema,
} from './schemas.js';

export * from './schemas.js';
export * from './rules/index.js';
export * from './ast.js';

function computeQualityScore(code: string, checks: VerificationCheck[]): number {
  const lineCount = code.trim().split('\n').length;
  let penalty = 0;

  if (lineCount > 100) {
    penalty += 20;
  } else if (lineCount > 50) {
    penalty += 10;
  }

  const warningChecks = checks.filter((c) => c.severity === 'warning');
  const failedWarnings = warningChecks.filter((c) => !c.passed).length;
  penalty += failedWarnings * 10;

  const passedChecks = checks.filter((c) => c.passed).length;
  const invariantRate = checks.length > 0 ? passedChecks / checks.length : 1;
  const baseScore = Math.round(invariantRate * 100);

  return Math.max(0, Math.min(100, baseScore - penalty));
}

export async function verifyTestArtifact(rawRequest: unknown): Promise<VerificationResult> {
  const request = await VerificationRequestSchema.parseAsync(rawRequest);
  const { code, framework, language } = request;

  const { parser } = await getTreeSitterParser(language);
  const tree = parseAst(parser, code);
  const rootNode = tree?.rootNode;

  try {
    const checks: VerificationCheck[] = [
      checkArbitraryWaits(code, framework, rootNode),
      checkAssertions(code, framework, rootNode),
      checkLocators(code, framework, rootNode),
      checkStateIsolation(code, framework, rootNode),
    ];

    const totalChecks = checks.length;
    const passedChecks = checks.filter((c) => c.passed).length;
    const complianceScore = totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 100;
    const qualityScore = computeQualityScore(code, checks);

    const passed = checks.every((c) =>
      c.severity === 'error' || c.severity === 'critical' ? c.passed : true
    );

    const actionableHints: string[] = checks
      .filter((c) => !c.passed && Boolean(c.suggestion))
      .map((c) => `[${c.id}] ${c.suggestion}`);

    return await VerificationResultSchema.parseAsync({
      passed,
      complianceScore,
      qualityScore,
      checks,
      actionableHints,
    });
  } finally {
    if (tree) {
      tree.delete();
    }
  }
}
