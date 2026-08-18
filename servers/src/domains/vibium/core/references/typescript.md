# Vibium Core & CLI Architecture — TypeScript API Reference (Vibium 26.x+)

> Official Vibium 26.5+ TypeScript browser lifecycle, launch options, and Sense-Think-Act CLI architecture.

---

## 1. Browser Lifecycle & Setup

```typescript
import { browser, browserSync, type Vibe, type Element } from 'vibium';

export async function runVibiumAsyncLifecycle(): Promise<void> {
  const vibe: Vibe = await browser.launch({
    headless: true,
  });

  try {
    await vibe.go('https://app.example.com');
    const title = await vibe.evaluate('() => document.title');
    console.log('Page Title:', title);

    const submitBtn: Element = await vibe.find({ role: 'button', text: 'Get Started' });
    await submitBtn.click();
  } finally {
    await vibe.quit();
  }
}

export function runVibiumSyncLifecycle(): void {
  const vibe: Vibe = browserSync.launch({ headless: true });
  try {
    vibe.go('https://app.example.com');
    const submitBtn: Element = vibe.find({ role: 'button', text: 'Get Started' });
    submitBtn.click();
  } finally {
    vibe.quit();
  }
}
```

---

## 2. Sense-Think-Act Execution Loop

Vibium operates on a tri-modal autonomous agent execution loop:

1. **Sense (`go` & `map`)**: Navigate to target URL and extract an accessibility-derived element map with ephemeral `@ref` identifiers (`@e1`, `@e2`).
2. **Think**: LLM agent evaluates accessibility roles, names, and state coordinates to select target references.
3. **Act**: Dispatch deterministic interactions (`click`, `fill`, `check`) with 6-point auto-waiting actionability.
4. **Diff Check (`diff map`)**: Inspect state mutations using differential snapshot checks (`vibium map --diff`) without re-parsing entire DOM trees.

```typescript
import { browser, type Vibe } from 'vibium';

export async function senseThinkActWorkflow(): Promise<void> {
  const vibe: Vibe = await browser.launch();

  try {
    await vibe.go('https://app.example.com/login');

    const emailInput = await vibe.find({ role: 'textbox', text: 'Email' });
    const submitBtn = await vibe.find({ role: 'button', text: 'Sign In' });

    await emailInput.fill('sdet@example.com');
    await submitBtn.click();

    await vibe.check('verify user lands on dashboard');
  } finally {
    await vibe.quit();
  }
}
```

---

## 3. CLI vs SDK Modes

| Mode    | Invocation                                      | Primary Use Case                                                             |
| :------ | :---------------------------------------------- | :--------------------------------------------------------------------------- |
| **CLI** | `vibium go <url>` / `vibium map`                | Terminal debugging, shell scripts, live agent inspection.                    |
| **SDK** | `import { browser, browserSync } from 'vibium'` | Enterprise CI/CD pipelines, type-safe Page Object Models, regression suites. |

### CLI Commands Reference (Vibium 26.5.31)

```bash
# Daemon Management (Eliminates cold-start browser launch latencies)
vibium daemon start
vibium daemon status
vibium daemon stop

# Sense: Navigate and map interactive elements to @e1, @e2
vibium go https://app.example.com
vibium map

# Act: Interact via ephemeral ref tags
vibium fill @e2 "sdet@example.com"
vibium click @e1

# Differential state inspection
vibium map --diff

# Capture screenshot artifact
vibium screenshot --output ./reports/screen.png
```

---

## 4. Best Practices

- **Zero Arbitrary Sleeps**: Rely exclusively on Vibium's auto-waiting actionability pipeline.
- **Always Quit Browser**: Ensure `await vibe.quit()` (or `vibe.quit()`) is invoked in `try / finally` blocks to prevent orphaned browser daemon processes.
- **Prefer Semantic Selectors**: Locate elements by role and text before falling back to CSS or XPath.
