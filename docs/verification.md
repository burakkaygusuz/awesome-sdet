# Deterministic Verification & Bounded Repair Architecture (v2)

> A technical specification of the **Deterministic Verification Engine**, **Invariant Rules**, **MCP Verification Tool**, and **Offline Benchmark Evals** in `awesome-sdet` v2.

---

## 1. Overview & Problem Statement

In v1, AI coding assistants generated test automation code in a single-pass (zero-shot) manner without automated validation. This introduced subtle, non-deterministic bugs:

- **Flaky Synchronization:** Using hardcoded time delays (`waitForTimeout`, `Thread.sleep`, `cy.wait(ms)`).
- **Missing Assertions:** Completing user flows without verifying UI/API state transitions.
- **Brittle Locators:** Generating brittle full-tree DOM paths (`//html/body/div[2]/table/...`).
- **State Leakage:** Sharing mutable static driver instances across parallel threads.

v2 introduces **Verification-Driven Generation & Bounded Repair**:

```
[ User Intent ]
       │
       ▼
[ Specialist Agent ] ──(Generates Code)──► [ Test Artifact ]
                                                  │
                                                  ▼
                                    [ verify_test_artifact ]
                                    (Deterministic AST Rules)
                                                  │
                                         ┌────────┴────────┐
                                         │                 │
                                      ✅ PASS           ❌ FAIL
                                         │                 │
                                         ▼                 ▼
                                  [ Return Code ]   [ Actionable Hints ]
                                                           │
                                                           ▼ (Max 2 Attempts)
                                                    [ Bounded Repair ]
```

---

## 2. Invariant Rules Engine (`servers/src/verification/rules/`)

The verification engine inspects test code using lightweight, high-performance static pattern rules across 5 supported frameworks:

| Invariant Rule            | ID                                 | Severity | Verification Scope                                                                                   | Target Remediation                                                                                    |
| ------------------------- | ---------------------------------- | -------- | ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| **No Arbitrary Waits**    | `no-arbitrary-waits`               | `error`  | Prohibits `waitForTimeout(N)`, `Thread.sleep(N)`, `time.sleep(N)`, `sleep(N)`, numeric `cy.wait(N)`. | Synchronize on auto-waiting assertions (e.g. `expect(locator).toBeVisible()`) or condition waiters.   |
| **Meaningful Assertions** | `meaningful-assertions`            | `error`  | Prohibits unasserted action chains; requires `expect()`, `Assert.*`, `assertThat()`, `.should()`.    | Add explicit assertions to verify state transitions and business outcomes.                            |
| **Resilient Locators**    | `resilient-accessibility-locators` | `error`  | Flags full-tree XPath chains (`//div[1]/table...`) and fragile index-based selectors.                | Anchor targets to accessible semantics (`getByRole`, `getByLabel`, `data-testid`, `accessibilityId`). |
| **State Isolation**       | `thread-isolated-state`            | `error`  | Prohibits shared mutable global driver instances (`public static WebDriver driver`).                 | Use per-test fixtures or `ThreadLocal<WebDriver>` for parallel safety.                                |

---

## 3. MCP Tool Contract: `verify_test_artifact`

### 3.1 Input Schema (`VerificationRequest`)

```typescript
export const VerificationRequestSchema = z.strictObject({
  code: z.string().min(1).describe('The generated or migrated test code to verify'),
  framework: z.enum(FRAMEWORK_IDS).describe('Target automation framework'),
  language: z.enum(SUPPORTED_LANGUAGES).default('typescript').describe('Programming language'),
  context: z.enum(['generation', 'migration', 'repair']).default('generation').optional(),
});
```

### 3.2 Output Schema (`VerificationResult`)

```typescript
export const VerificationResultSchema = z.strictObject({
  passed: z.boolean().describe('True if all error-severity checks passed'),
  score: z.number().min(0).max(100).describe('Deterministic compliance score (0-100)'),
  checks: z.array(VerificationCheckSchema).describe('List of invariant rule evaluations'),
  actionableHints: z.array(z.string()).describe('Actionable hints for model self-correction'),
});
```

---

## 4. Bounded Self-Repair Loop (`MAX_REPAIR_ATTEMPTS = 2`)

To eliminate the risk of infinite ReAct loops and unbounded context consumption:

1. When `verify_test_artifact` returns `passed: false`, the tool provides concise, structured `actionableHints`:
   ```text
   [no-arbitrary-waits] Replace arbitrary sleep with framework-native dynamic condition waiter (e.g. expect(locator).toBeVisible()).
   [resilient-accessibility-locators] Replace brittle XPath/DOM index paths with accessible locators (e.g. getByRole, getByLabel).
   ```
2. The agent has a **hard boundary of at most 2 repair iterations**.
3. If verification still fails after 2 repair attempts, the agent breaks the loop and escalates with a structured diagnostics report containing the exact failing checks and evidence.

---

## 5. Offline Evaluation Benchmark Suite (`evals/`)

The evaluation suite runs in CI without external LLM API costs or network latency:

- **`evals/routing/framework-routing.eval.ts`:** 28 developer query fixtures verifying 100% accurate framework and skill routing.
- **`evals/anti-patterns/anti-patterns.eval.ts`:** 30 synthetic fixtures verifying 100% anti-pattern detection (recall: 1.0, precision: 1.0).
- **`evals/security/prompt-injection.eval.ts`:** 19 attack vectors verifying 100% XML boundary containment and prompt injection neutralization.

Run all evals:

```bash
pnpm run test:evals
```
