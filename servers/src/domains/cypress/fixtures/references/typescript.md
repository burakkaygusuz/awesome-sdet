# Cypress Fixtures, File I/O & Viewport — TypeScript API Reference (Cypress 15.x+)

> Official Cypress 15+ TypeScript test data fixtures, file upload (selectFile), file I/O, and viewport emulation.

---

## 1. Fixture Loading & File Selection (`cy.fixture`, `cy.selectFile`)

```typescript
interface UserFixture {
  admin: {
    username: string;
  };
}

cy.fixture<UserFixture>('users.json').as('userData');

cy.get('@userData').then((users: UserFixture) => {
  cy.get('#username').type(users.admin.username);
});

cy.get('input[type="file"]').selectFile('cypress/fixtures/profile-picture.png');

cy.fixture('profile-picture.png', null).as('profilePic');
cy.get('input[type="file"]').selectFile('@profilePic', { action: 'drag-drop' });
```

---

## 2. File I/O & Viewport Emulation

```typescript
cy.writeFile('cypress/fixtures/session.json', { token: 'auth-token-123' });
cy.readFile('cypress/fixtures/session.json').its('token').should('eq', 'auth-token-123');

cy.viewport('iphone-x');
cy.viewport(1920, 1080);
```

---

## 3. Best Practices & Anti-Patterns

- **Use Native `selectFile`**: Use native `cy.selectFile()` instead of deprecated third-party upload plugins.
- **Use Fixture Aliases in Hooks**: Load fixtures in `beforeEach()` using `cy.fixture().as('alias')` to ensure fresh state for every test.
- **Clean Generated Files**: Remove temporary test artifacts written with `cy.writeFile()` after suite completion.
