# Cypress Network Interception & API Testing — TypeScript API Reference (Cypress 15.x+)

## 1. Route Stubbing & Spying (`cy.intercept`)

```typescript
cy.intercept('GET', '/api/v1/users', { fixture: 'users.json' }).as('getUsers');

cy.visit('/dashboard');
cy.wait('@getUsers').its('response.statusCode').should('eq', 200);
```

## 2. API Requests (`cy.request`)

```typescript
cy.request<UserResponse>('POST', '/api/v1/auth', { username: 'admin' }).then((res) => {
  expect(res.status).to.eq(200);
  window.localStorage.setItem('authToken', res.body.token);
});
```
