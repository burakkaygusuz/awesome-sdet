# Vibium State & Recording Management — TypeScript API Reference

> Vibium (v26.5.31) provides authentication state snapshots (`storageState`), session tracing, recording chunking/grouping, and multi-tab context isolation.

---

## 1. Storage State & Auth Snapshots

Save and reuse authentication cookies and local storage tokens to eliminate repetitive login steps:

```typescript
import { browser, type Browser, type Vibe } from 'vibium';

export async function captureAndReuseAuthState(): Promise<void> {
  const bro: Browser = await browser.start({ headless: true });

  try {
    // Perform one-time login and persist auth snapshot
    const authPage: Vibe = await bro.page();
    await authPage.go('https://app.example.com/login');

    const userInput = await authPage.find('label=Username');
    await userInput.fill('enterprise-admin');

    const passInput = await authPage.find('label=Password');
    await passInput.fill('SecureP@ssword123');

    const loginBtn = await authPage.find({ role: 'button', text: 'Sign In' });
    await loginBtn.click();

    await bro.storageState({ path: '.auth/admin-state.json' });
  } finally {
    await bro.stop();
  }

  // Initialize new session with pre-authenticated storageState (bypasses UI login)
  const testBro: Browser = await browser.start({
    headless: true,
    storageState: '.auth/admin-state.json',
  });

  try {
    const testPage: Vibe = await testBro.page();
    await testPage.go('https://app.example.com/dashboard');
  } finally {
    await testBro.stop();
  }
}
```

---

## 2. Multi-Tab & Page Management

```typescript
import { type Browser, type Vibe } from 'vibium';

export async function handleMultiTab(bro: Browser, vibe: Vibe): Promise<void> {
  const newVibe: Vibe = await bro.newPage();
  await newVibe.go('https://app.example.com/docs');

  const pages: Vibe[] = await bro.pages();
  console.log('Open tab count:', pages.length);

  await vibe.bringToFront();
  await newVibe.close();
}
```

---

## 3. Session Tracing & Recording (CLI v26.5.31)

Vibium 26.5.31 includes advanced recording subcommands for test chunking and group isolation:

```bash
# Start full video and BiDi event recording
vibium record start --video --output ./reports/session.zip

# Grouping subcommands (v26.5.31)
vibium record start-group --name "login-flow"
vibium go https://app.example.com/login
vibium record stop-group

# Chunking subcommands (v26.5.31)
vibium record start-chunk --name "checkout-step-1"
vibium click @e5
vibium record stop-chunk

# Finalize recording
vibium record stop
```

---

## 4. Best Practices

- **Never share storage state across concurrent workers**: Give each parallel worker thread its own isolated storage state file.
- **Use chunked recordings for long journeys**: Leverage `start-chunk` and `stop-chunk` to split large test runs into distinct debuggable archives.
- **Always close browser on teardown**: Auto-flush recordings and finalize storage snapshots.
