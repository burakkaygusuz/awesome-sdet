# Vibium Selectors & Locators — JavaScript API Reference (Vibium 26.x+)

> Vibium (v26.5.31) provides high-resilience semantic locators, open Shadow DOM piercing combinators (`>>`, `>>>`), and chainable locator scoping.

---

## 1. Semantic Locator Strategies (`vibe.find`)

```javascript
async function demonstrateSemanticLocators(vibe) {
  const submitBtn = await vibe.find({ role: 'button', text: 'Sign In' });
  await submitBtn.click();

  const emailInput = await vibe.find('label=Email');
  await emailInput.fill('user@example.com');

  const submitCard = await vibe.find('testid=submit-card');

  const successText = await vibe.find('text=Account created');
  await successText.waitFor();
}
```

---

## 2. Pierce Combinators (`>>` and `>>>`)

```javascript
async function pierceShadowRoots(vibe) {
  const formSubmit = await vibe.find('form.auth-form >> button[type="submit"]');
  await formSubmit.click();

  // '>>>' pierces nested Web Components across open Shadow Root boundaries
  const shadowBtn = await vibe.find('custom-header >>> account-menu >>> button#logout');
  await shadowBtn.click();
}
```

---

## 3. Subtree Scoping & Chaining

```javascript
async function scopedLocators(vibe) {
  const row = await vibe.find({ role: 'row', text: 'Alice Smith' });
  const editBtn = await row.find({ role: 'button', text: 'Edit' });
  await editBtn.click();
}
```
