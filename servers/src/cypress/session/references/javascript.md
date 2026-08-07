# Cypress Session & Multi-Origin Testing (JavaScript)

## 1. Fast Auth Session Caching (`cy.session`)

```javascript
cy.session('user-auth', () => {
  cy.request('POST', '/api/login', { user: 'test' }).then((res) => {
    cy.setCookie('session_id', res.body.id);
  });
});
```

## 2. Multi-Origin Domain Testing (`cy.origin`)

```javascript
cy.visit('https://app.example.com');
cy.get('#external-auth-btn').click();

cy.origin('https://auth.thirdparty.com', () => {
  cy.get('#username').type('user@example.com');
  cy.get('#submit').click();
});
```
