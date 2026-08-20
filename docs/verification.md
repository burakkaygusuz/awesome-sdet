# Deterministic Static Invariant Scanner & Bounded Repair (v2)

> A technical specification of the **Deterministic Static Invariant Scanner**, **Rule Scopes & Bounded Guarantees**, **MCP Scanner Tool**, and **Offline Benchmark Evals** in `awesome-sdet` v2.

---

## 1. Overview & Problem Statement

In v1, AI coding assistants generated test automation code in an open-ended (zero-shot) manner without automated validation. This frequently introduced subtle, non-deterministic anti-patterns:

- **Flaky Synchronization:** Using hardcoded time delays (`waitForTimeout`, `Thread.sleep`, `cy.wait(ms)`).
- **Missing Assertions:** Completing user flows without asserting any UI or API state transitions.
- **Brittle Locators:** Generating fragile full-tree DOM paths (`//html/body/div[2]/table/...`).
- **State Leakage:** Sharing mutable static driver instances across parallel test threads.

v2 introduces the **Deterministic Static Invariant Scanner & Bounded Repair Loop**:

```
[ User Intent ]
       │
       ▼
[ Specialist Agent ] ──(Generates Code)──► [ Test Artifact ]
                                                  │
                                                  ▼
                                    [ verify_test_artifact ]
                                 (Static Invariant Scanner)
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

## 2. Invariant Rules Engine & Bounded Scope Guarantees

The scanner inspects test code using lightweight, high-speed lexical and syntactic pattern rules (<5ms execution time, $0 LLM cost) across 5 supported frameworks.

### 2.1 Rule Matrix & Guarantee Boundaries

| Invariant Rule            | ID                                 | Severity | What It Strictly Guarantees (Scope)                                                                           | What It Does NOT Guarantee (Non-Scope)                                                           | Target Remediation                                                                       |
| :------------------------ | :--------------------------------- | :------: | :------------------------------------------------------------------------------------------------------------ | :----------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------- |
| **No Arbitrary Waits**    | `no-arbitrary-waits`               | `error`  | Prohibits explicit hardcoded sleeps (`waitForTimeout`, `Thread.sleep`, `time.sleep`, numeric `cy.wait(N)`).   | Does not evaluate complex runtime network latency or dynamic backend timing.                     | Use auto-waiting assertions (e.g. `expect(locator).toBeVisible()`) or condition polling. |
| **Meaningful Assertions** | `meaningful-assertions`            | `error`  | Enforces the structural presence of recognized framework assertions (`expect()`, `Assert.*`, `.should()`).    | Does not evaluate semantic business intent (e.g. dummy `expect(true).toBe(true)` is not proven). | Add explicit domain assertions to verify business state transitions.                     |
| **Resilient Locators**    | `resilient-accessibility-locators` | `error`  | Flags known syntactic anti-patterns: full-tree XPath (`//div[1]/table...`) and fragile index-based selectors. | Cannot inspect live DOM or detect unstable hashed CSS classes (e.g. `.x123`).                    | Anchor targets to accessible semantics (`getByRole`, `getByLabel`, `data-testid`).       |
| **State Isolation**       | `thread-isolated-state`            | `error`  | Prohibits explicit shared mutable global driver instances (`public static WebDriver`).                        | Does not verify external database sandbox isolation or process-level thread safety.              | Use per-test fixtures or `ThreadLocal<WebDriver>` for parallel thread safety.            |

---

## 3. AST Parsing vs. Static Invariant Scanning

To maintain strict technical clarity across the platform:

1. **Polyglot AST Syntax Verification (`web-tree-sitter`):** Executed exclusively at **CI build time** via [`scripts/validators/snippets-validator.ts`](../scripts/validators/snippets-validator.ts). Compiles markdown code blocks across 8 languages to guarantee that shipped documentation contains valid grammar.
2. **Deterministic Static Invariant Scanner:** Executed at **runtime** via [`servers/src/verification/`](../servers/src/verification/) and exposed through the `verify_test_artifact` MCP tool. Operates as a fast, deterministic static pattern linter to guard against known SDET anti-patterns before code delivery.

---

## 4. MCP Tool Contract: `verify_test_artifact`

### 4.1 Input Schema (`VerificationRequest`)

```typescript
export const VerificationRequestSchema = z.strictObject({
  code: z.string().min(1).describe('The generated or migrated test code to verify'),
  framework: z.enum(FRAMEWORK_IDS).describe('Target automation framework'),
  language: z.enum(SUPPORTED_LANGUAGES).default('typescript').describe('Programming language'),
  context: z.enum(['generation', 'migration', 'repair']).default('generation').optional(),
});
```

### 4.2 Output Schema (`VerificationResult`)

```typescript
export const VerificationResultSchema = z.strictObject({
  passed: z.boolean().describe('True if all error-severity checks passed'),
  score: z.number().min(0).max(100).describe('Deterministic compliance score (0-100)'),
  checks: z.array(VerificationCheckSchema).describe('List of invariant rule evaluations'),
  actionableHints: z.array(z.string()).describe('Actionable hints for model self-correction'),
});
```

---

## 5. Bounded Self-Repair Loop (`MAX_REPAIR_ATTEMPTS = 2`)

To eliminate the risk of runaway agent loops and unbounded token consumption:

1. When `verify_test_artifact` returns `passed: false`, the tool provides concise, structured `actionableHints`:
   ```text
   [no-arbitrary-waits] Replace arbitrary sleep with framework-native dynamic condition waiter (e.g. expect(locator).toBeVisible()).
   [resilient-accessibility-locators] Replace brittle XPath/DOM index paths with accessible locators (e.g. getByRole, getByLabel).
   ```
2. The agent operates within a **hard boundary of at most 2 repair iterations**.
3. If verification still fails after 2 repair attempts, the agent breaks the loop and escalates with a structured diagnostics report containing the failing checks and evidence.

---

## 6. Offline Evaluation Benchmark Suite (`evals/`)

The evaluation suite runs in CI without external LLM API costs or network latency:

- **`evals/routing/framework-routing.eval.ts`:** 28 developer query fixtures verifying 100% accurate framework and skill routing.
- **`evals/anti-patterns/anti-patterns.eval.ts`:** 30 synthetic fixtures verifying 100% anti-pattern detection (recall: 1.0, precision: 1.0).
- **`evals/security/prompt-injection.eval.ts`:** 19 attack vectors verifying 100% structural prompt boundary containment (`containmentScore: 1.0`).

### 6.1 Two-Layer Prompt Security Model

| Security Layer                                | Mechanism                                            | Evaluation Method                                          | Current Scope & Guarantees                                                                                                     |
| :-------------------------------------------- | :--------------------------------------------------- | :--------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------- |
| **Layer 1: Structural Boundary Preservation** | `wrapUntrustedContent()` with tag neutralization     | Deterministic Offline Regex Benchmarks (`evals/security/`) | **Guaranteed:** Proves that closing tags cannot escape designated `<untrusted_*>` containers.                                  |
| **Layer 2: Model Behavioral Robustness**      | `PASSIVE_DATA_INVARIANT` behavioral system directive | Probabilistic Live LLM Response Evaluation                 | **Model-Dependent:** Instructs models to treat enclosed text as passive analysis data; measured via live inference benchmarks. |

Run all evals:

```bash
pnpm run test:evals
```
