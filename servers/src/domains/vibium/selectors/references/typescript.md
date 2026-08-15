# Vibium Selectors & Locators — TypeScript API Reference (Vibium 26.x+)

> Vibium (v26.5.31) provides high-resilience semantic locators, open Shadow DOM piercing combinators (`>>`, `>>>`), and chainable locator scoping.

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

Vibium includes explicit combinators for chaining and piercing Shadow DOM boundaries:

| Combinator | Behavior                                                                               | Example                                            |
| :--------- | :------------------------------------------------------------------------------------- | :------------------------------------------------- |
| **`>>`**   | **Single Shadow Boundary Piercing** — Crosses the host element's own Shadow Root.      | `vibe.find('user-card >> p')`                      |
| **`>>>`**  | **Deep Shadow DOM Piercing** — Pierces across open Shadow Root boundaries recursively. | `vibe.find('user-avatar >>> shadow-icon >>> svg')` |

### Shadow DOM Piercing Example

```typescript
import { type Vibe, type Element } from 'vibium';

export async function pierceShadowRoots(vibe: Vibe): Promise<void> {
  const editButton: Element = await vibe.find('user-card >> button.edit');
  await editButton.click();

  const nestedButton: Element = await vibe.find( at any depth
  const nestedButton: Element = await vibe.find(
    'app-header >>> user-profile-card >>> #edit-profile-btn'
  );
  await nestedButton.click();
}
```

---

## 3. Subtree Scoping & Chaining

```typescript
import { type Vibe, type Element } from 'vibium';

export async function scopedLocators(vibe: Vibe): Promise<void> {
  const userRow: Element = await vibe.find({ role: 'row', text: 'Jane Doe' });

  // Chain query directly within the parent subtree
  const editButton: Element = await userRow.find({ role: 'button', text: 'Edit' });
  await editButton.click();
}
```

---

## 4. Best Practices & Priority Hierarchy

1. 🥇 **`find({ role, text })` / `find({ label })`**: User-facing accessibility contracts.
2. 🥈 **`find({ testid })`**: Dedicated QA contract (`data-testid`).
3. 🥉 **`find({ text })` / `find({ placeholder })`**: Content matching.
4. 🏅 **`>>>` Piercing**: Complex shadow root boundaries in Web Components.
5. ❌ **Avoid raw XPath or brittle CSS paths** (`div > div:nth-child(3) > span`).
