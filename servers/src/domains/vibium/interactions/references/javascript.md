# Vibium Interactions & Actionability — JavaScript API Reference (Vibium 26.x+)

> Vibium (v26.5.31) automatically performs comprehensive actionability checks before executing any interaction, preventing race conditions and test flakiness.

---

## 1. Interaction Primitives

```javascript
async function executeInteractions(vibe) {
  const submitBtn = await vibe.find({ role: 'button', text: 'Submit' });
  await submitBtn.click();

  // fill(): atomic value replacement; type(): sequential keystrokes
  const input = await vibe.find({ label: 'Search Query' });
  await input.fill('test automation');
  await input.type(' keyword');

  await input.press('Enter');

  // Idempotent checkbox state toggles
  const checkbox = await vibe.find({ label: 'Subscribe to newsletter' });
  await checkbox.check();
  await checkbox.uncheck();

  const navDropdown = await vibe.find({ testid: 'nav-dropdown' });
  await navDropdown.hover();
  await navDropdown.highlight();

  const source = await vibe.find({ testid: 'card-source' });
  const target = await vibe.find({ testid: 'card-target' });
  await source.dragTo(target);
}

module.exports = { executeInteractions };
```
