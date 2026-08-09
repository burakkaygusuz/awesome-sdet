# Cypress Network Interception & API Testing — JavaScript API Reference (Cypress 15.x+)

## 1. Static & Dynamic Route Stubbing (`cy.intercept`)

```javascript
cy.intercept('GET', '/api/v1/users', { fixture: 'users.json' }).as('getUsers');

cy.intercept('POST', '/api/v1/orders', (req) => {
  expect(req.body).to.have.property('itemId');
  req.headers['x-custom-auth'] = 'test-token';

  req.reply((res) => {
    res.body.status = 'CONFIRMED';
    res.delay = 500;
  });
}).as('createOrder');

cy.visit('/checkout');
cy.get('#submit-order').click();

cy.wait('@createOrder').its('response.statusCode').should('eq', 200);
```

## 2. Direct API Requests (`cy.request`)

```javascript
cy.request('POST', '/api/v1/auth', { username: 'admin', password: 'secret' }).then((res) => {
  expect(res.status).to.eq(200);
  window.localStorage.setItem('authToken', res.body.token);
});
```

## 3. Best Practices & Anti-Patterns

- **Use Route Aliases**: Always assign `.as('aliasName')` to `cy.intercept` and synchronize with `cy.wait('@aliasName')`.
- **Prefer `cy.request` for Seeding**: Bypass repetitive UI login/data-creation steps by making direct API calls.
