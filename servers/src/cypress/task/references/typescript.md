# Cypress Node.js Task & OS Command Execution (TypeScript)

## 1. Node.js Event Handlers (`setupNodeEvents` & `cy.task`)

```typescript
// cypress.config.ts
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      on('task', {
        async resetDatabase() {
          await db.truncateAll();
          return null;
        },
        async seedUser(user: { email: string; role: string }) {
          const created = await db.users.create(user);
          return created.id;
        },
      });
      return config;
    },
  },
});
```

```typescript
// test/example.cy.ts
beforeEach(() => {
  cy.task('resetDatabase');
  cy.task<string>('seedUser', { email: 'admin@example.com', role: 'admin' }).then((userId) => {
    cy.visit(`/users/${userId}`);
  });
});
```

## 2. OS Command Execution (`cy.exec`)

```typescript
cy.exec('npm run db:seed').its('code').should('eq', 0);
```
