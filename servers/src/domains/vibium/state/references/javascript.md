# Vibium State & Recording Management — JavaScript API Reference (Vibium 26.x+)

> Official Vibium 26.5+ JavaScript authentication state snapshots (`storageState`), session cookies, local storage serialization, session tracing, and multi-tab context isolation.

---

## 1. Storage State & Auth Snapshots

```javascript
const { browser } = require('vibium');

async function manageStorageState() {
  const vibe = await browser.launch({ headless: true });
  try {
    await vibe.go('https://app.example.com/login');

    const userInput = await vibe.find({ label: 'Username' });
    await userInput.fill('admin');

    const passInput = await vibe.find({ label: 'Password' });
    await passInput.fill('SecureP@ssword123');

    const loginBtn = await vibe.find({ role: 'button', text: 'Sign In' });
    await loginBtn.click();

    await vibe.storageState({ path: '.auth/admin-state.json' });
  } finally {
    await vibe.quit();
  }

  const testVibe = await browser.launch({
    headless: true,
    storageState: '.auth/admin-state.json',
  });
  try {
    await testVibe.go('https://app.example.com/dashboard');
  } finally {
    await testVibe.quit();
  }
}
```

---

## 2. Multi-Tab & Page Management

```javascript
async function handleTabs(mainVibe) {
  const newTab = await mainVibe.newPage();
  await newTab.go('https://app.example.com/docs');

  const pages = await mainVibe.pages();

  await mainVibe.bringToFront();
  await newTab.close();
}
```

---

## 3. Session Cookies & Local Storage Serialization

```javascript
async function manageCookiesAndStorage(vibe) {
  await vibe.setCookies([
    {
      name: 'session_token',
      value: 'jwt_secure_token_xyz',
      domain: '.example.com',
      path: '/',
      httpOnly: true,
      secure: true,
    },
  ]);

  const cookies = await vibe.cookies('https://app.example.com');

  await vibe.evaluate(() => {
    localStorage.setItem('theme', 'dark');
    localStorage.setItem('feature_flags', JSON.stringify({ beta_dashboard: true }));
  });

  await vibe.clearCookies();
}

module.exports = {
  manageStorageState,
  handleTabs,
  manageCookiesAndStorage,
};
```

---

## 4. Session Tracing & Recording (CLI v26.5.31)

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

## 5. Best Practices

- **Never share storage state across concurrent workers**: Give each parallel worker thread its own isolated storage state file.
- **Use chunked recordings for long journeys**: Leverage `start-chunk` and `stop-chunk` to split large test runs into distinct debuggable archives.
- **Always close browser on teardown**: Auto-flush recordings and finalize storage snapshots inside `try / finally` blocks.
