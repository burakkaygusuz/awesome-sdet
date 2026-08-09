# Cypress Stubs, Spies & Clock Control (JavaScript)

## 1. Function Stubbing (`cy.stub`)

```javascript
cy.visit('/', {
  onBeforeLoad(win) {
    cy.stub(win, 'prompt').returns('custom input').as('winPrompt');
  },
});

cy.get('@winPrompt').should('be.calledWith', 'Enter your name');
```

## 2. Function Spying (`cy.spy`)

```javascript
const user = {
  notify: (msg) => console.log(msg),
};

cy.spy(user, 'notify').as('notifySpy');
user.notify('Hello');

cy.get('@notifySpy').should('have.been.calledWith', 'Hello');
```

## 3. System Clock & Timer Control (`cy.clock`, `cy.tick`)

```javascript
// Freeze clock and advance time deterministically without real delays
cy.clock();
cy.visit('/dashboard');

// Fast-forward virtual timer to trigger setTimeout/setInterval
cy.tick(5000);
cy.get('#session-timeout-banner').should('be.visible');

cy.clock().then((clock) => clock.restore());
```
