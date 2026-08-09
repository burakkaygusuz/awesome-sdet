# Cypress Fixtures, File I/O & Viewport — JavaScript API Reference (Cypress 15.x+)

## 1. Fixture Data Loading (`cy.fixture`)

```javascript
cy.fixture('user.json').then((userData) => {
  expect(userData.name).to.eq('Jane Doe');
});
```

## 2. Reading & Writing Files (`cy.readFile`, `cy.writeFile`)

```javascript
cy.readFile('cypress/fixtures/config.json').its('environment').should('eq', 'staging');
cy.writeFile('cypress/downloads/output.txt', 'Test run completed successfully');
```

## 3. Dynamic Viewport Emulation (`cy.viewport`)

```javascript
cy.viewport(1280, 720);
cy.viewport('iphone-x', 'portrait');
```
