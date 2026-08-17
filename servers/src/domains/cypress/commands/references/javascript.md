# Cypress Core Commands & Assertions — JavaScript API Reference (Cypress 15.x+)

> Official Cypress 15+ JavaScript core commands, DOM queries, dynamic assertions, and chaining patterns.

---

## 1. Finding & Scoping Elements (`cy.get`, `cy.find`, `cy.contains`)

```javascript
cy.get('[data-testid="user-table"]')
  .find('tr.user-row')
  .first()
  .find('[data-testid="edit-btn"]')
  .click();

cy.contains('button', 'Submit').should('not.be.disabled');
```

---

## 2. Dynamic Assertions (`.should()`, `.and()`)

```javascript
cy.get('.status-badge').should('have.class', 'active').and('have.attr', 'data-state', 'ready');

cy.get('.item-list').should(($list) => {
  expect($list).to.have.length(3);
  expect($list.eq(0)).to.contain('Item 1');
});
```

---

## 3. Scoping & Filtering (`.within`, `.filter`, `.eq`)

```javascript
cy.get('form.login').within(() => {
  cy.get('input[name="email"]').should('be.visible');
});

cy.get('li.todo').filter('.completed').should('have.length', 2);
cy.get('tr')
  .filter((idx, el) => Cypress.$(el).data('active') === true)
  .should('exist');

cy.get('ul.options li').eq(0).click();
```

---

## 4. Best Practices & Anti-Patterns

- **Never use `async/await` with Cypress**: Cypress commands enqueue operations into an internal queue; `await` breaks retry-ability and command synchronization.
- **Use DOM Scoping**: Prefer `cy.get().find()` for component-scoped queries rather than deep global CSS selectors.
