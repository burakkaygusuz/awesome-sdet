# Vibium Selectors & Locators — TypeScript API Reference (Vibium 26.x+)

> Official Vibium 26.5+ TypeScript semantic locators, open Shadow DOM piercing combinators, and scoped element queries.

---

## 1. Semantic Locator Strategies (`vibe.find`)

Semantic queries identify elements based on accessibility semantics rather than fragile CSS hierarchies:

```typescript
import { browser, type Browser, type Vibe, type Element } from 'vibium';

export async function demonstrateSemanticLocators(vibe: Vibe): Promise<void> {
  const submitBtn: Element = await vibe.find({ role: 'button', text: 'Sign In' });
  await submitBtn.click();

  const usernameInput: Element = await vibe.find({ label: 'Email address' });
  await usernameInput.fill('sdet@example.com');
  console.log('Username field value:', await usernameInput.value());

  const cartBadge: Element = await vibe.find({ testid: 'cart-item-count' });
  console.log('Cart count text:', await cartBadge.text());

  const confirmationMsg: Element = await vibe.find({ text: 'Order confirmed successfully' });
  await confirmationMsg.waitFor();

  const searchField: Element = await vibe.find({ placeholder: 'Search catalog...' });
  await searchField.fill('BiDi testing');
}
```

---

## 2. Pierce Combinators (`>>` and `>>>`)

Vibium includes explicit combinators for chaining, iframe traversal, and piercing Shadow DOM boundaries:

| Combinator | Behavior                                                                               | Example                                                               |
| :--------- | :------------------------------------------------------------------------------------- | :-------------------------------------------------------------------- |
| **`>>`**   | **Single Boundary Piercing** — Crosses host element shadow root or enters an iframe.   | `vibe.find('user-card >> p')` / `vibe.find('iframe#login >> button')` |
| **`>>>`**  | **Deep Shadow DOM Piercing** — Pierces across open Shadow Root boundaries recursively. | `vibe.find('user-avatar >>> shadow-icon >>> svg')`                    |

### Shadow DOM & Iframe Piercing Example

```typescript
import { type Vibe, type Element } from 'vibium';

export async function pierceShadowRootsAndFrames(vibe: Vibe): Promise<void> {
  const editButton: Element = await vibe.find('user-card >> button.edit');
  await editButton.click();

  const nestedButton: Element = await vibe.find(
    'app-header >>> user-profile-card >>> #edit-profile-btn'
  );
  await nestedButton.click();

  const frameInput: Element = await vibe.find('iframe#payment-frame >> input#card-number');
  await frameInput.fill('4242424242424242');
}
```

---

## 3. Subtree Scoping & Multi-Element Collections (`find`, `findAll`)

```typescript
import { type Vibe, type Element } from 'vibium';

export async function scopedLocators(vibe: Vibe): Promise<void> {
  const userRow: Element = await vibe.find({ role: 'row', text: 'Jane Doe' });
  const editButton: Element = await userRow.find({ role: 'button', text: 'Edit' });
  await editButton.click();

  const allRows: Element[] = await vibe.findAll({ role: 'row' });
  console.log(`Found ${allRows.length} total rows`);

  for (const row of allRows) {
    const rowButtons: Element[] = await row.findAll('button');
    console.log(`Row contains ${rowButtons.length} action buttons`);
  }
}
```

---

## 4. Best Practices & Priority Hierarchy

1. **`find({ role, text })` / `find({ label })`**: User-facing accessibility contracts.
2. **`find({ testid })`**: Dedicated QA contract (`data-testid`).
3. **`find({ text })` / `find({ placeholder })`**: Content matching.
4. **`>>>` Piercing / `>>` Iframe**: Complex shadow root boundaries and embedded frames.
5. Avoid raw XPath or brittle CSS paths (`div > div:nth-child(3) > span`).
