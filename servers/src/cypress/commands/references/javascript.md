# Cypress Core Commands & Assertions — JavaScript API Reference (Cypress 15.x+)

## 1. Finding Elements (`cy.get`, `cy.find`, `cy.contains`)

```javascript
cy.get('[data-testid="submit-btn"]').should('be.visible').click();
cy.contains('button', 'Submit').should('not.be.disabled');
```

## 2. Dynamic Assertions (`.should()`, `.and()`)

```javascript
cy.get('.status-badge').should('have.class', 'active').and('have.attr', 'data-state', 'ready');
```
