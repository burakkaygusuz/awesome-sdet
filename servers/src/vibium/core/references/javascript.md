# Vibium Core & CLI Architecture — JavaScript API Reference (Vibium 26.x+)

> Vibium (v26.5.31) is an AI-native browser automation framework built on W3C WebDriver BiDi, unifying the Sense-Think-Act agent loop, `@ref` element mapping, and multi-language client libraries.

---

## 1. Browser Lifecycle & Setup

```javascript
const { browser } = require('vibium');

async function runVibiumLifecycle() {
  const bro = await browser.start({ headless: true });
  try {
    const vibe = await bro.page();
    await vibe.go('https://app.example.com');

    const title = await vibe.evaluate('() => document.title');
    console.log('Page Title:', title);

    const submitBtn = await vibe.find({ role: 'button', text: 'Get Started' });
    await submitBtn.click();
  } finally {
    // Guaranteed graceful teardown preventing orphaned daemon processes
    await bro.stop();
  }
}

module.exports = { runVibiumLifecycle };
```

---

## 2. Sense-Think-Act Execution Loop

```javascript
const { browser } = require('vibium');

async function senseThinkActWorkflow() {
  const bro = await browser.start();
  try {
    const vibe = await bro.page();
    await vibe.go('https://app.example.com/login');

    const emailInput = await vibe.find({ role: 'textbox', text: 'Email' });
    await emailInput.fill('sdet@example.com');

    const submitBtn = await vibe.find({ role: 'button', text: 'Sign In' });
    await submitBtn.click();

    await vibe.check('verify user lands on dashboard');
  } finally {
    await bro.stop();
  }
}

module.exports = { senseThinkActWorkflow };
```

---

## 3. CLI vs SDK Modes

| Mode    | Command                                 | Description                                               |
| :------ | :-------------------------------------- | :-------------------------------------------------------- |
| **CLI** | `vibium go <url>` / `vibium map`        | Terminal debugging, shell scripts, live agent inspection. |
| **SDK** | `const { browser } = require('vibium')` | Scripted automation and CI/CD test suites.                |
