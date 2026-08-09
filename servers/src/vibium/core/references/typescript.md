# Vibium Core & CLI Architecture — TypeScript API Reference (Vibium 26.x+)

> Vibium (v26.5.31) is an AI-native browser automation framework built on W3C WebDriver BiDi, unifying the Sense-Think-Act agent loop, `@ref` element mapping, and multi-language client libraries.

---

## 1. Browser Lifecycle & Setup

```typescript
import { browser, type Browser, type Vibe, type Element } from 'vibium';

export async function runVibiumLifecycle(): Promise<void> {
  const bro: Browser = await browser.start({
    headless: true,
  });

  try {
    const vibe: Vibe = await bro.page();
    await vibe.go('https://app.example.com');

    const title = await vibe.evaluate('() => document.title');
    console.log('Page Title:', title);

    const submitBtn: Element = await vibe.find({ role: 'button', text: 'Get Started' });
    await submitBtn.click();
  } finally {
    // Guaranteed graceful teardown preventing orphaned daemon processes
    await bro.stop();
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
import { browser, type Browser, type Vibe } from 'vibium';

export async function senseThinkActWorkflow(): Promise<void> {
  const bro: Browser = await browser.start();

  try {
    const vibe: Vibe = await bro.page();
    await vibe.go('https://app.example.com/login');

    const emailInput = await vibe.find({ role: 'textbox', text: 'Email' });
    const submitBtn = await vibe.find({ role: 'button', text: 'Sign In' });

    await emailInput.fill('sdet@example.com');
    await submitBtn.click();

    await vibe.check('verify user lands on dashboard');
  } finally {
    await bro.stop();
  }
}
```

---

## 3. CLI vs SDK Modes

| Mode    | Invocation                         | Primary Use Case                                                             |
| :------ | :--------------------------------- | :--------------------------------------------------------------------------- |
| **CLI** | `vibium go <url>` / `vibium map`   | Terminal debugging, shell scripts, live agent inspection.                    |
| **SDK** | `import { browser } from 'vibium'` | Enterprise CI/CD pipelines, type-safe Page Object Models, regression suites. |

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
- **Always Stop Browser**: Ensure `await bro.stop()` is invoked in `try / finally` blocks to prevent orphaned browser daemon processes.
- **Prefer Semantic Selectors**: Locate elements by role and text before falling back to CSS or XPath.
