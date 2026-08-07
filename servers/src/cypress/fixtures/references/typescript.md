# Cypress Fixtures, File I/O & Viewport Emulation (TypeScript)

## 1. Fixture Data Loading (`cy.fixture`)

```typescript
// Load JSON fixture data for network stubs or assertions
cy.fixture<{ id: number; name: string }>('user.json').then((userData) => {
  expect(userData.name).to.eq('Jane Doe');
});
```

## 2. Reading & Writing Files (`cy.readFile`, `cy.writeFile`)

```typescript
// Read and verify config or download file
cy.readFile('cypress/fixtures/config.json').its('environment').should('eq', 'staging');

// Write test results to disk
cy.writeFile('cypress/downloads/output.txt', 'Test run completed successfully');
```

## 3. Dynamic Viewport Emulation (`cy.viewport`)

```typescript
// Set explicit resolution or device preset
cy.viewport(1280, 720); // Desktop HD
cy.viewport('iphone-x', 'portrait'); // Mobile device
```
