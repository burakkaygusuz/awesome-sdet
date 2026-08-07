# Cypress Component Testing & Custom Frameworks (JavaScript)

Cypress supports Component Testing across major frontend frameworks (React, Vue, Angular, Svelte) and provides a public API for building custom framework definitions (Solid.js, Lit, Qwik).

## 1. React (`cypress/react`)

```javascript
import { mount } from 'cypress/react';
import Stepper from './Stepper';

describe('<Stepper />', () => {
  it('renders and increments counter', () => {
    mount(<Stepper initialCount={0} />);
    cy.get('[data-cy="increment"]').click();
    cy.get('[data-cy="counter"]').should('have.text', '1');
  });
});
```

## 2. Vue 3 (`cypress/vue`)

```javascript
import { mount } from 'cypress/vue';
import Stepper from './Stepper.vue';

describe('<Stepper />', () => {
  it('mounts Vue component with props', () => {
    mount(Stepper, { props: { initialCount: 5 } });
    cy.get('button').click();
    cy.get('.count').should('contain', '6');
  });
});
```

## 3. Angular (`cypress/angular`)

```javascript
import { mount } from 'cypress/angular';
import { StepperComponent } from './stepper.component';

describe('StepperComponent', () => {
  it('mounts Angular component', () => {
    mount(StepperComponent, {
      componentProperties: { count: 10 },
    });
    cy.get('.counter-val').should('have.text', '10');
  });
});
```

## 4. Svelte (`cypress/svelte`)

```javascript
import { mount } from 'cypress/svelte';
import Counter from './Counter.svelte';

describe('Counter.svelte', () => {
  it('mounts Svelte component with props', () => {
    mount(Counter, { props: { count: 42 } });
    cy.get('button').contains(42);
  });
});
```

## 5. Custom Framework Definitions & `cy.mount` Registration

For custom UI frameworks (e.g. Solid.js, Preact, Lit) or global `cy.mount` usage:

### A. Registering Global `cy.mount` Command (`cypress/support/component.js`)

```javascript
import { mount } from 'cypress/react'; // or custom framework mount adapter

Cypress.Commands.add('mount', mount);
```

### B. Custom Framework Definition (`cypress-ct-*`)

```javascript
const { defineFrameworkDefinition } = require('cypress');

module.exports = defineFrameworkDefinition({
  type: '@org/cypress-ct-solid-js',
  name: 'Solid.js',
  supportedBundlers: ['vite'],
  detectors: [
    {
      type: 'solid-js',
      name: 'Solid',
      package: 'solid-js',
      minVersion: '^1.6.0',
    },
  ],
  dependencies: () => [
    {
      type: 'solid-js',
      name: 'Solid',
      package: 'solid-js',
    },
  ],
});
```
