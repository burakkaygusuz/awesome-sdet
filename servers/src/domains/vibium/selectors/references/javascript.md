# Vibium Selectors & Locators — JavaScript API Reference (Vibium 26.x+)

> Official Vibium 26.5+ JavaScript semantic locators, open Shadow DOM piercing combinators, and scoped element queries.

---

## 1. Semantic Locator Strategies (`vibe.find`)

```javascript
async function demonstrateSemanticLocators(vibe) {
  const submitBtn = await vibe.find({ role: 'button', text: 'Sign In' });
  await submitBtn.click();

  const emailInput = await vibe.find({ label: 'Email' });
  await emailInput.fill('user@example.com');
  const emailValue = await emailInput.value();

  const submitCard = await vibe.find({ testid: 'submit-card' });
  const cardText = await submitCard.text();

  const searchInput = await vibe.find({ placeholder: 'Search catalog...' });
  await searchInput.fill('test query');

  const successText = await vibe.find({ text: 'Account created' });
  await successText.waitFor();
}

module.exports = { demonstrateSemanticLocators };
```

---

## 2. Pierce Combinators (`>>` and `>>>`)

| Combinator | Behavior                                                                               | Example                                                               |
| :--------- | :------------------------------------------------------------------------------------- | :-------------------------------------------------------------------- |
| **`>>`**   | **Single Boundary Piercing** — Crosses host element shadow root or enters an iframe.   | `vibe.find('user-card >> p')` / `vibe.find('iframe#login >> button')` |
| **`>>>`**  | **Deep Shadow DOM Piercing** — Pierces across open Shadow Root boundaries recursively. | `vibe.find('custom-header >>> account-menu >>> button#logout')`       |

```javascript
async function pierceShadowRootsAndFrames(vibe) {
  const editButton = await vibe.find('user-card >> button.edit');
  await editButton.click();

  const shadowBtn = await vibe.find('custom-header >>> account-menu >>> button#logout');
  await shadowBtn.click();

  const frameInput = await vibe.find('iframe#checkout-frame >> input#zipcode');
  await frameInput.fill('94105');
}

module.exports = { pierceShadowRootsAndFrames };
```

---

## 3. Subtree Scoping & Multi-Element Collections (`find`, `findAll`)

```javascript
async function scopedLocators(vibe) {
  const row = await vibe.find({ role: 'row', text: 'Alice Smith' });
  const editBtn = await row.find({ role: 'button', text: 'Edit' });
  await editBtn.click();

  const allRows = await vibe.findAll({ role: 'row' });
  for (const r of allRows) {
    const actionButtons = await r.findAll('button');
  }
}

module.exports = { scopedLocators };
```

---

## 4. Best Practices & Priority Hierarchy

1. **`find({ role, text })` / `find({ label })`**: User-facing accessibility contracts.
2. **`find({ testid })`**: Dedicated QA contract (`data-testid`).
3. **`find({ text })` / `find({ placeholder })`**: Content matching.
4. **`>>>` Piercing / `>>` Iframe**: Complex shadow root boundaries and embedded frames.
5. Avoid raw XPath or brittle CSS paths (`div > div:nth-child(3) > span`).
