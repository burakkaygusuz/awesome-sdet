# Vibium Interactions & Actionability — TypeScript API Reference (Vibium 26.x+)

> Vibium (v26.5.31) automatically performs comprehensive actionability checks before executing any interaction, preventing race conditions and test flakiness.

---

## 1. Actionability Guarantees

Before dispatching an action, Vibium ensures the target element meets all relevant criteria:

| Check               | Description                                                        | Click | Fill/Type | Hover | Check/Uncheck |
| :------------------ | :----------------------------------------------------------------- | :---: | :-------: | :---: | :-----------: |
| **Attached**        | Element is connected to the active DOM tree.                       |  ✅   |    ✅     |  ✅   |      ✅       |
| **Visible**         | Element has non-zero geometry and is not hidden (`display: none`). |  ✅   |    ✅     |  ✅   |      ✅       |
| **Stable**          | Element is not actively animating or transitioning.                |  ✅   |    ✅     |  ✅   |      ✅       |
| **Receives Events** | Element is top-most at coordinates and not obscured.               |  ✅   |    ✅     |  ✅   |      ✅       |
| **Enabled**         | Element is not marked `disabled` or `aria-disabled`.               |  ✅   |    ✅     |  ✅   |      ✅       |
| **Editable**        | Element is not marked `readonly` or immutable.                     |   —   |    ✅     |   —   |       —       |

---

## 2. Interaction Methods

```typescript
import { type Vibe, type Element } from 'vibium';

export async function demonstrateInteractions(vibe: Vibe): Promise<void> {
  const username: Element = await vibe.find({ label: 'Username' });
  const password: Element = await vibe.find({ label: 'Password' });
  const loginBtn: Element = await vibe.find({ role: 'button', text: 'Log In' });

  // fill(): Fast atomic replacement with input/change events; type(): sequential physical keystrokes
  await username.fill('sdet-engineer');
  await password.type('SuperSecretP@ss!');

  await loginBtn.click();

  const searchInput: Element = await vibe.find({ placeholder: 'Search' });
  await searchInput.press('Control+A');
  await searchInput.press('Backspace');
  await searchInput.press('Enter');

  // Idempotent checkbox state toggles
  const termsCheckbox: Element = await vibe.find({ label: 'I agree to Terms' });
  await termsCheckbox.check();
  await termsCheckbox.uncheck();

  const infoIcon: Element = await vibe.find({ testid: 'help-tooltip-trigger' });
  await infoIcon.hover();
  await infoIcon.highlight();
  const box = await infoIcon.bounds();
  console.log('Element bounding box:', box);

  const sourceItem: Element = await vibe.find({ testid: 'draggable-item-1' });
  const targetZone: Element = await vibe.find({ testid: 'drop-target-zone' });
  await sourceItem.dragTo(targetZone);
}
```

---

## 3. Best Practices

- **Avoid manual sleep intervals**: Never insert `sleep()` or arbitrary delays before interactions. Rely on Vibium's built-in actionability auto-waiting.
- **Prefer `fill()` over `type()` for forms**: Use `fill()` for standard form inputs to speed up test execution, reserving `type()` only for auto-complete search boxes or rate-limited inputs.
- **Natural language intent**: Use `await vibe.do("click login")` and `await vibe.check("verify status is active")` for AI-agent-directed steps.
