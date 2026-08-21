import { describe, expect, it } from 'vitest';

import {
  verifyTestArtifact,
  type VerificationRequest,
} from '../../servers/src/verification/index.js';

describe('Unified Verification Engine', () => {
  it('evaluates clean test artifacts with 100 score and all checks passing', async () => {
    const request: VerificationRequest = {
      framework: 'playwright',
      language: 'typescript',
      code: `
        import { test, expect } from '@playwright/test';
        test('valid login', async ({ page }) => {
          await page.goto('/login');
          await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
        });
      `,
    };

    const result = await verifyTestArtifact(request);
    expect(result.passed).toBe(true);
    expect(result.score).toBe(100);
    expect(result.complianceScore).toBe(100);
    expect(result.qualityScore).toBe(100);
    expect(result.actionableHints).toEqual([]);
    expect(result.checks).toHaveLength(4);
    expect(result.checks.every((c) => c.passed)).toBe(true);
  });

  it('aggregates multiple rule failures into actionable hints and reduces score proportionally', async () => {
    const request: VerificationRequest = {
      framework: 'playwright',
      code: `
        test('multiple flaws', async ({ page }) => {
          await page.goto('/login');
          await page.waitForTimeout(3000);
          await page.locator('//html/body/div/button').click();
        });
      `,
    };

    const result = await verifyTestArtifact(request);
    expect(result.passed).toBe(false);
    expect(result.score).toBe(25);
    expect(result.actionableHints).toHaveLength(3);
    expect(result.actionableHints.some((h) => h.includes('[no-arbitrary-waits]'))).toBe(true);
    expect(result.actionableHints.some((h) => h.includes('[meaningful-assertions]'))).toBe(true);
    expect(
      result.actionableHints.some((h) => h.includes('[resilient-accessibility-locators]'))
    ).toBe(true);
  });

  it('evaluates catastrophic failure with score 0 when all rules fail', async () => {
    const request: VerificationRequest = {
      framework: 'selenium',
      code: `
        public class BadTest {
          public static WebDriver driver;
          public void testBad() {
            Thread.sleep(5000);
            driver.findElement(By.xpath("//html/body/div[1]")).click();
          }
        }
      `,
    };

    const result = await verifyTestArtifact(request);
    expect(result.passed).toBe(false);
    expect(result.score).toBe(0);
    expect(result.complianceScore).toBe(0);
    expect(result.checks.every((c) => !c.passed)).toBe(true);
  });

  it('decouples complianceScore from qualityScore for oversized tests with clean invariants', async () => {
    const longCleanCode = `
      import { test, expect } from '@playwright/test';
      test('long scenario', async ({ page }) => {
        await page.goto('/login');
        ${'await expect(page.getByRole("button")).toBeVisible();\n'.repeat(55)}
      });
    `;
    const request: VerificationRequest = {
      framework: 'playwright',
      code: longCleanCode,
    };

    const result = await verifyTestArtifact(request);
    expect(result.passed).toBe(true);
    expect(result.complianceScore).toBe(100);
    expect(result.qualityScore).toBe(90);
    expect(result.score).toBe(100);
  });

  it('validates input boundaries and rejects invalid or empty requests', async () => {
    await expect(verifyTestArtifact({ framework: 'playwright', code: '' })).rejects.toThrow();
    await expect(
      verifyTestArtifact({ framework: 'invalid-fw', code: 'test()' } as unknown)
    ).rejects.toThrow();
    await expect(verifyTestArtifact(null)).rejects.toThrow();
  });
});
