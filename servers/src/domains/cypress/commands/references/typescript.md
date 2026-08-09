# Cypress Core Commands & Assertions — TypeScript API Reference (Cypress 15.x+)

## 1. Finding & Scoping Elements (`cy.get`, `cy.find`, `cy.contains`)

```typescript
cy.get('[data-testid="user-table"]')
  .find('tr.user-row')
  .first()
  .find('[data-testid="edit-btn"]')
  .click();

cy.contains('button', 'Submit').should('not.be.disabled');
```

## 2. Dynamic Assertions (`.should()`, `.and()`)

```typescript
cy.get('.status-badge').should('have.class', 'active').and('have.attr', 'data-state', 'ready');

cy.get('.item-list').should(($list) => {
  expect($list).to.have.length(3);
  expect($list.eq(0)).to.contain('Item 1');
});
```

## 3. Best Practices & Anti-Patterns

- **Never use `async/await` with Cypress**: Cypress commands enqueue operations into an internal queue; `await` breaks retry-ability and command synchronization.
- **Use DOM Scoping**: Prefer `cy.get().find()` for component-scoped queries rather than deep global CSS selectors.
