# Cypress Component Testing & Framework Mount — JavaScript API Reference (Cypress 15.x+)

> Official Cypress 15+ JavaScript Component Testing mount APIs, framework adapters, and custom definitions.

---

## 1. Multi-Framework Component Mounting (`mount`)

```javascript
import React from 'react';
import { mount } from 'cypress/react';
import Button from './Button';

Cypress.Commands.add('mount', mount);

describe('<Button />', () => {
  it('renders with label and fires click handler', () => {
    const onClickSpy = cy.spy().as('onClick');
    cy.mount(<Button label="Click Me" onClick={onClickSpy} />);
    cy.get('button').contains('Click Me').click();
    cy.get('@onClick').should('have.been.calledOnce');
  });
});
```

---

## 2. Vue 3 & Angular Mounting

```javascript
import { mount } from 'cypress/vue';
import UserProfile from './UserProfile.vue';

describe('<UserProfile />', () => {
  it('renders user details', () => {
    cy.mount(UserProfile, {
      props: { username: 'cypress_user' },
    });
    cy.get('.username').should('contain.text', 'cypress_user');
  });
});
```

---

## 3. Custom Framework Definition (`defineFrameworkDefinition`)

```javascript
const { defineFrameworkDefinition } = require('cypress');

module.exports = defineFrameworkDefinition({
  type: '@org/cypress-ct-custom',
  name: 'Custom Framework',
  supportedBundlers: ['vite', 'webpack'],
  detectors: [{ type: 'dependency', name: 'custom-framework' }],
  dependencies: () => [
    {
      type: 'custom-framework',
      name: 'Custom Framework',
      package: 'custom-framework',
    },
  ],
});
```

---

## 4. Best Practices & Anti-Patterns

- **Isolate Component State**: Test components in isolation without loading full application routing or server state.
- **Use Spies for Callbacks**: Assert component event emissions with `cy.spy().as('spyName')` and Chai Sinon assertions.
