# Cypress Fixtures, File I/O & Viewport Emulation (TypeScript)

## 1. Fixture Data Loading (`cy.fixture`)

```typescript
cy.fixture<{ id: number; name: string }>('user.json').then((userData) => {
  expect(userData.name).to.eq('Jane Doe');
});
```

## 2. Reading & Writing Files (`cy.readFile`, `cy.writeFile`)

```typescript
cy.readFile('cypress/fixtures/config.json').its('environment').should('eq', 'staging');
cy.writeFile('cypress/downloads/output.txt', 'Test run completed successfully');
```

## 3. Dynamic Viewport Emulation (`cy.viewport`)

```typescript
cy.viewport(1280, 720);
cy.viewport('iphone-x', 'portrait');
```
