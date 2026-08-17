# Cypress Stubs, Spies & Clock Control — JavaScript API Reference (Cypress 15.x+)

> Official Cypress 15+ JavaScript function spies (cy.spy), method stubs (cy.stub), and timer clocks (cy.clock, cy.tick).

---

## 1. Function Stubbing (`cy.stub`)

```javascript
cy.visit('/', {
  onBeforeLoad(win) {
    cy.stub(win, 'prompt').returns('custom input').as('winPrompt');
  },
});

cy.get('@winPrompt').should('be.calledWith', 'Enter your name');
```

---

## 2. Function Spying (`cy.spy`)

```javascript
const user = {
  notify: (msg) => console.log(msg),
};

cy.spy(user, 'notify').as('notifySpy');
user.notify('Hello');

cy.get('@notifySpy').should('have.been.calledWith', 'Hello');
```

---

## 3. System Clock & Timer Control (`cy.clock`, `cy.tick`)

```javascript
cy.clock();
cy.visit('/dashboard');

cy.tick(5000);
cy.get('#session-timeout-banner').should('be.visible');

cy.clock().invoke('restore');
```

---

## 4. Best Practices & Anti-Patterns

- **Deterministic Timers**: Advance application timers using `cy.clock()` and `cy.tick(ms)` instead of real `cy.wait(ms)` delays.
- **Automatic Cleanup**: Spies, stubs, and clocks are automatically restored between tests by Cypress.
