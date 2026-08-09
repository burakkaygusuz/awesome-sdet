# Cypress Fixtures, File I/O & Viewport — JavaScript API Reference (Cypress 15.x+)

## 1. Fixture Loading & Aliasing

```javascript
cy.fixture('users.json').as('userData');

cy.get('@userData').then((users) => {
  cy.get('#username').type(users.admin.username);
});

cy.fixture('profile-picture.png', 'binary')
  .then(Cypress.Blob.binaryStringToBlob)
  .then((fileBlob) => {
    cy.get('input[type="file"]').attachFile({
      fileContent: fileBlob,
      fileName: 'profile-picture.png',
      mimeType: 'image/png',
    });
  });
```

## 2. File I/O & Viewport Emulation

```javascript
cy.writeFile('cypress/fixtures/session.json', { token: 'auth-token-123' });
cy.readFile('cypress/fixtures/session.json').its('token').should('eq', 'auth-token-123');

cy.viewport('iphone-x');
cy.viewport(1920, 1080);
```

## 3. Best Practices & Anti-Patterns

- **Use Fixture Aliases in Hooks**: Load fixtures in `beforeEach()` using `cy.fixture().as('alias')` to ensure fresh state for every test.
- **Clean Generated Files**: Remove temporary test artifacts written with `cy.writeFile()` after suite completion.
