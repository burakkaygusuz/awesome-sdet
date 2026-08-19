# Vibium Core & CLI Architecture — JavaScript API Reference (Vibium 26.x+)

> Official Vibium 26.5+ JavaScript browser lifecycle, launch options, and Sense-Think-Act CLI architecture.

---

## 1. Browser Lifecycle & Setup

```javascript
const { browser, browserSync } = require('vibium');

async function runVibiumAsyncLifecycle() {
  const vibe = await browser.launch({ headless: true });
  try {
    await vibe.go('https://app.example.com');
    const title = await vibe.evaluate('() => document.title');
    console.log('Page Title:', title);

    const submitBtn = await vibe.find({ role: 'button', text: 'Get Started' });
    await submitBtn.click();
  } finally {
    await vibe.quit();
  }
}

function runVibiumSyncLifecycle() {
  const vibe = browserSync.launch({ headless: true });
  try {
    vibe.go('https://app.example.com');
    const submitBtn = vibe.find({ role: 'button', text: 'Get Started' });
    submitBtn.click();
  } finally {
    vibe.quit();
  }
}

module.exports = { runVibiumAsyncLifecycle, runVibiumSyncLifecycle };
```

---

## 2. Sense-Think-Act Execution Loop

```javascript
const { browser } = require('vibium');

async function senseThinkActWorkflow() {
  const vibe = await browser.launch();
  try {
    await vibe.go('https://app.example.com/login');

    const emailInput = await vibe.find({ role: 'textbox', text: 'Email' });
    await emailInput.fill('sdet@example.com');

    const submitBtn = await vibe.find({ role: 'button', text: 'Sign In' });
    await submitBtn.click();

    await vibe.check('verify user lands on dashboard');
  } finally {
    await vibe.quit();
  }
}

module.exports = { senseThinkActWorkflow };
```

---

## 3. CLI vs SDK Modes

| Mode    | Command                                              | Description                                               |
| :------ | :--------------------------------------------------- | :-------------------------------------------------------- |
| **CLI** | `vibium go <url>` / `vibium map`                     | Terminal debugging, shell scripts, live agent inspection. |
| **SDK** | `const { browser, browserSync } = require('vibium')` | Scripted automation and CI/CD test suites.                |

---

## 4. Best Practices

- **Zero Arbitrary Sleeps**: Rely exclusively on Vibium's auto-waiting actionability pipeline.
- **Always Quit Browser**: Ensure `await vibe.quit()` or `vibe.quit()` is invoked in `try / finally` blocks to prevent orphaned browser daemon processes.
- **Prefer Semantic Selectors**: Locate elements by role and text before falling back to CSS or XPath.
