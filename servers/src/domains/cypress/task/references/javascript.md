# Cypress Node.js Task & OS Command Execution — JavaScript API Reference (Cypress 15.x+)

## 1. Node Task Execution (`cy.task`)

### Configuration & Task Handler (`cypress.config.js`)

```javascript
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      on('task', {
        seedDatabase(data) {
          console.log('Seeding DB with', data.users, 'users');
          return { success: true, count: data.users };
        },
      });
    },
  },
});
```

### Spec Execution (`spec.cy.js`)

```javascript
cy.task('seedDatabase', { users: 10 }).then((result) => {
  expect(result.success).to.be.true;
  expect(result.count).to.eq(10);
});
```

## 2. Shell Command Execution (`cy.exec`)

```javascript
cy.exec('npm run db:reset', { failOnNonZeroExit: true, timeout: 20000 }).then((result) => {
  expect(result.code).to.eq(0);
  expect(result.stdout).to.contain('Database reset complete');
});
```

## 3. Best Practices & Anti-Patterns

- **Return Value Requirement**: `cy.task` event handlers must always return a JSON-serializable value or `null`. Returning `undefined` triggers a Cypress execution error.
- **Set Realistic Timeouts**: Assign explicit timeout options for long-running database migrations in `cy.exec`.
