# Cypress Shadow DOM Traversal — JavaScript API Reference (Cypress 15.x+)

> Official Cypress 15+ JavaScript Shadow DOM traversal (.shadow()) and automatic piercing (includeShadowDom).

---

## 1. Explicit Shadow Root Traversal (`.shadow()`)

```javascript
cy.get('custom-web-component').shadow().find('.internal-action-button').click();
```

---

## 2. Automatic Shadow DOM Ingestion (`includeShadowDom`)

### Command-Level Configuration

```javascript
cy.get('.my-shadow-element', { includeShadowDom: true }).click();
```

### Global Configuration (`cypress.config.js`)

```javascript
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    includeShadowDom: true,
  },
});
```

---

## 3. Best Practices & Anti-Patterns

- **Use `.shadow()` for Isolated Targets**: Use `.shadow()` when inspecting specific Web Component boundaries.
- **Enable `includeShadowDom` Globals Cautiously**: Global shadow piercing can match unintended internal elements; prefer command-level option where appropriate.
