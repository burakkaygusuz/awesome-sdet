# Cypress Session & Multi-Origin Testing — TypeScript API Reference (Cypress 15.x+)

> Official Cypress 15+ TypeScript session caching (cy.session) and multi-domain workflow (cy.origin) automation.

---

## 1. Fast Auth Session Caching with Validation (`cy.session`)

```typescript
cy.session(
  'user-session',
  () => {
    cy.request<{ token: string }>('POST', '/api/login', {
      username: 'testuser',
      password: 'password123',
    }).then((res) => {
      cy.setCookie('session_id', res.body.token);
    });
  },
  {
    validate() {
      cy.getCookie('session_id').should('exist');
      cy.request('/api/user/profile').its('status').should('eq', 200);
    },
    cacheAcrossSpecs: true,
  }
);
```

---

## 2. Multi-Origin Domain Testing (`cy.origin`)

```typescript
const userEmail = 'user@example.com';

cy.visit('https://app.example.com');
cy.get('#external-auth-btn').click();

cy.origin('https://auth.thirdparty.com', { args: { userEmail } }, ({ userEmail }) => {
  cy.get('#username').type(userEmail);
  cy.get('#submit').click();
});
```

---

## 3. Best Practices & Anti-Patterns

- **Include `validate` Callback**: Always define a `validate()` function in `cy.session()` so stale sessions are automatically recreated.
- **Pass Arguments to `cy.origin`**: `cy.origin()` runs in an isolated JS context; pass outer scope variables using the `args` option.
