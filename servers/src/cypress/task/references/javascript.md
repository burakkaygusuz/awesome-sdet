# Cypress Node.js Task & OS Command Execution (JavaScript)

## 1. Node.js Event Handlers (`setupNodeEvents` & `cy.task`)

```javascript
// cypress.config.js
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      on('task', {
        async resetDatabase() {
          await db.truncateAll();
          return null;
        },
        async seedUser(user) {
          const created = await db.users.create(user);
          return created.id;
        },
      });
      return config;
    },
  },
});
```

```javascript
// test/example.cy.js
beforeEach(() => {
  cy.task('resetDatabase');
  cy.task('seedUser', { email: 'admin@example.com', role: 'admin' }).then((userId) => {
    cy.visit(`/users/${userId}`);
  });
});
```

## 2. OS Command Execution (`cy.exec`)

```javascript
cy.exec('npm run db:seed').its('code').should('eq', 0);
```
