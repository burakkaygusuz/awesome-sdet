# Appium Mobile Locator Strategies — TypeScript API Reference (Appium 2.x+)

> Official Appium 2.x & WebdriverIO v9+ TypeScript selector strategies, accessibility trees, and Screen Object Model.

---

## 1. Selector Strategies Implementation

```typescript
import { remote } from 'webdriverio';

export async function demonstrateLocators(driver: WebdriverIO.Browser): Promise<void> {
  const loginBtn = await driver.$('~login_button');
  await loginBtn.click();

  const navHeader = await driver.$(
    '-ios class chain:**/XCUIElementTypeNavigationBar/XCUIElementTypeStaticText[`label == "Dashboard"`]'
  );
  const headerText = await navHeader.getText();
  console.log('Nav Header:', headerText);

  const submitBtn = await driver.$(
    '-ios predicate string:type == "XCUIElementTypeButton" AND name == "Submit" AND visible == 1'
  );
  await submitBtn.click();

  const settingsItem = await driver.$(
    'android=new UiSelector().text("Settings").className("android.widget.TextView")'
  );
  await settingsItem.click();

  const devOptions = await driver.$(
    'android=new UiScrollable(new UiSelector().scrollable(true)).scrollIntoView(new UiSelector().text("Developer Options"))'
  );
  await devOptions.click();

  const userInput = await driver.$('id=com.example.app:id/input_username');
  await userInput.setValue('sdet_user');
}
```

---

## 2. Screen Object Model (SOM) Implementation

```typescript
import type { ChainablePromiseElement } from 'webdriverio';

export class LoginScreen {
  constructor(private driver: WebdriverIO.Browser) {}

  get usernameInput(): ChainablePromiseElement {
    return this.driver.$('~username_input');
  }

  get passwordInput(): ChainablePromiseElement {
    return this.driver.$('~password_input');
  }

  get loginButton(): ChainablePromiseElement {
    return this.driver.$('~login_submit_btn');
  }

  async login(user: string, pass: string): Promise<void> {
    await this.usernameInput.setValue(user);
    await this.passwordInput.setValue(pass);
    await this.loginButton.click();
  }
}
```

---

## 3. Best Practices & Invariants

- **Prefer Accessibility ID**: Always prioritize `~accessibility_id` for speed and cross-platform resilience.
- **Encapsulate in Screen Objects**: Structure tests into Screen Object Model classes with typed getters (see `skills/sdet-authoring`).
- **Avoid Recursive XPath**: Do not write deep absolute XPath queries (`/hierarchy/android.widget...`) on mobile trees.
- **Native Scroll with `UiScrollable`**: Use Android `UiScrollable` to scroll and locate in a single operation.

## Image Locator

- Image-based locator for canvas UIs without semantic attributes: the `-image` prefix in WebdriverIO selectors (e.g. `$('-image:path/to/element.png')`) (requires the Appium images plugin).
