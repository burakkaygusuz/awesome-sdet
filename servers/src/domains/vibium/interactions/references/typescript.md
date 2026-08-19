# Vibium Interactions & Actionability — TypeScript API Reference (Vibium 26.x+)

> Official Vibium 26.5+ TypeScript auto-waiting interaction primitives, actionability checks, and pointer mechanics.

---

## 1. Interaction Methods

```typescript
import { type Vibe, type Element } from 'vibium';

export async function demonstrateInteractions(vibe: Vibe): Promise<void> {
  const username: Element = await vibe.find({ label: 'Username' });
  const password: Element = await vibe.find({ label: 'Password' });
  const loginBtn: Element = await vibe.find({ role: 'button', text: 'Log In' });

  await username.fill('sdet-engineer');
  await password.type('SuperSecretP@ss!');
  console.log('Username field value:', await username.value());

  await loginBtn.click();

  const roleSelect: Element = await vibe.find({ role: 'combobox', text: 'Role' });
  await roleSelect.select('ADMIN');

  const searchInput: Element = await vibe.find({ placeholder: 'Search' });
  await searchInput.press('Control+A');
  await searchInput.press('Backspace');
  await searchInput.press('Enter');

  const termsCheckbox: Element = await vibe.find({ label: 'I agree to Terms' });
  await termsCheckbox.check();
  await termsCheckbox.uncheck();

  const infoIcon: Element = await vibe.find({ testid: 'help-tooltip-trigger' });
  await infoIcon.hover();
  await infoIcon.highlight();
  const box = await infoIcon.bounds();
  console.log('Element bounding box:', box);
  console.log('Tooltip text:', await infoIcon.text());

  const sourceItem: Element = await vibe.find({ testid: 'draggable-item-1' });
  const targetZone: Element = await vibe.find({ testid: 'drop-target-zone' });
  await sourceItem.dragTo(targetZone);
}
```

---

## 2. Best Practices & Action Invariants

- **Avoid manual sleep intervals**: Never insert `sleep()` or arbitrary delays before interactions. Rely on Vibium's built-in actionability auto-waiting.
- **Prefer `fill()` over `type()` for forms**: Use `fill()` for standard form inputs to speed up test execution, reserving `type()` only for auto-complete search boxes or rate-limited inputs.
- **Natural language intent**: Use `await vibe.do("click login")` and `await vibe.check("verify status is active")` for AI-agent-directed steps.
