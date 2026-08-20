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

export async function verifyTestArtifact(rawRequest: unknown): Promise<VerificationResult> {
  const request = await VerificationRequestSchema.parseAsync(rawRequest);
  const { code, framework } = request;

  const checks: VerificationCheck[] = [
    checkArbitraryWaits(code, framework),
    checkAssertions(code, framework),
    checkLocators(code, framework),
    checkStateIsolation(code, framework),
  ];

  const totalChecks = checks.length;
  const passedChecks = checks.filter((c) => c.passed).length;
  const score = totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 100;
  const passed = checks.every((c) =>
    c.severity === 'error' || c.severity === 'critical' ? c.passed : true
  );

  const actionableHints: string[] = checks
    .filter((c) => !c.passed && Boolean(c.suggestion))
    .map((c) => `[${c.id}] ${c.suggestion}`);

  return await VerificationResultSchema.parseAsync({
    passed,
    score,
    checks,
    actionableHints,
  });
}
