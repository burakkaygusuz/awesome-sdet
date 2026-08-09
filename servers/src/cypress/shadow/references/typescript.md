# Cypress Shadow DOM Traversal — TypeScript API Reference (Cypress 15.x+)

## 1. Explicit Shadow Root Traversal (`.shadow()`)

```typescript
cy.get('custom-web-component').shadow().find('.internal-action-button').click();
```

## 2. Automatic Shadow DOM Ingestion (`includeShadowDom`)

### Command-Level Configuration

```typescript
cy.get('.my-shadow-element', { includeShadowDom: true }).click();
```

### Global Configuration (`cypress.config.ts`)

```typescript
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    includeShadowDom: true,
  },
});
```

## 3. Best Practices & Anti-Patterns

- **Use `.shadow()` for Isolated Targets**: Use `.shadow()` when inspecting specific Web Component boundaries.
- **Enable `includeShadowDom` Globals Cautiously**: Global shadow piercing can match unintended internal elements; prefer command-level option where appropriate.
