# Vibium Interactions & Actionability — JavaScript API Reference (Vibium 26.x+)

> Official Vibium 26.5+ JavaScript auto-waiting interaction primitives, actionability checks, and pointer mechanics.

---

## 1. Actionability Guarantees

Before dispatching an action, Vibium ensures the target element meets all relevant criteria:

| Check               | Description                                                        | Click | Fill / Type | Select | Hover | Check / Uncheck | DragTo |
| :------------------ | :----------------------------------------------------------------- | :---: | :---------: | :----: | :---: | :-------------: | :----: |
| **Attached**        | Element is connected to the active DOM tree.                       |  ✅   |     ✅      |   ✅   |  ✅   |       ✅        |   ✅   |
| **Visible**         | Element has non-zero geometry and is not hidden (`display: none`). |  ✅   |     ✅      |   ✅   |  ✅   |       ✅        |   ✅   |
| **Stable**          | Element is not actively animating or transitioning.                |  ✅   |     ✅      |   ✅   |  ✅   |       ✅        |   ✅   |
| **Receives Events** | Element is top-most at coordinates and not obscured.               |  ✅   |     ✅      |   ✅   |  ✅   |       ✅        |   ✅   |
| **Enabled**         | Element is not marked `disabled` or `aria-disabled`.               |  ✅   |     ✅      |   ✅   |   —   |       ✅        |   ✅   |
| **Editable**        | Element is not marked `readonly` or immutable.                     |   —   |     ✅      |   ✅   |   —   |        —        |   —    |

---

## 2. Interaction Methods

```javascript
async function executeInteractions(vibe) {
  const submitBtn = await vibe.find({ role: 'button', text: 'Submit' });
  await submitBtn.click();

  const input = await vibe.find({ label: 'Search Query' });
  await input.fill('test automation');
  await input.type(' keyword');
  await input.value();

  await input.press('Enter');

  const dropdown = await vibe.find({ role: 'combobox', text: 'Department' });
  await dropdown.select('QA_ENGINEERING');

  const checkbox = await vibe.find({ label: 'Subscribe to newsletter' });
  await checkbox.check();
  await checkbox.uncheck();

  const navDropdown = await vibe.find({ testid: 'nav-dropdown' });
  await navDropdown.hover();
  await navDropdown.highlight();
  const box = await navDropdown.bounds();
  await navDropdown.text();

  const source = await vibe.find({ testid: 'card-source' });
  const target = await vibe.find({ testid: 'card-target' });
  await source.dragTo(target);
}

module.exports = { executeInteractions };
```

---

## 3. Best Practices & Action Invariants

- **Zero Arbitrary Sleeps**: Never use `setTimeout()` or manual delays. Vibium automatically synchronizes on actionability checks.
- **Atomic Form Input**: Always prefer `fill()` over `type()` for form automation unless physical keydown events are specifically tested.
- **Agent Execution**: Dispatch high-level autonomous actions via `await vibe.do("click submit")` and assertions via `await vibe.check("verify confirmation")`.
