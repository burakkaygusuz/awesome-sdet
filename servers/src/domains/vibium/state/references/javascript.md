# Vibium State & Recording Management — JavaScript API Reference (Vibium 26.x+)

> Vibium (v26.5.31) provides authentication state snapshots (`storageState`), session tracing, recording chunking/grouping, and multi-tab context isolation.

---

## 1. Storage State Snapshots

```javascript
const { browser } = require('vibium');

async function manageStorageState() {
  // Capture authenticated state snapshot
  const bro = await browser.start({ headless: true });
  try {
    const authPage = await bro.page();
    await authPage.go('https://app.example.com/login');

    const userInput = await authPage.find({ label: 'User' });
    await userInput.fill('admin');

    const loginBtn = await authPage.find({ role: 'button', text: 'Login' });
    await loginBtn.click();

    await bro.storageState({ path: 'auth.json' });
  } finally {
    await bro.stop();
  }

  // Reuse storageState to bypass repeated UI logins
  const testBro = await browser.start({ headless: true, storageState: 'auth.json' });
  try {
    const testPage = await testBro.page();
    await testPage.go('https://app.example.com/dashboard');
  } finally {
    await testBro.stop();
  }
}

module.exports = { manageStorageState };
```

---

## 2. Multi-Tab Handling

```javascript
async function handleTabs(bro) {
  const mainTab = await bro.page();
  const helpTab = await bro.newPage();

  await helpTab.go('https://app.example.com/help');
  console.log('Open tabs:', (await bro.pages()).length);

  await mainTab.bringToFront();
  await helpTab.close();
}

module.exports = { manageStorageState, handleTabs };
```
