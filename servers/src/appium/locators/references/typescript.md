# Appium Mobile Locator Strategies — TypeScript API Reference (Appium 3.x+)

> Official Appium 3.6.0+ & WebdriverIO v9.30.1+ TypeScript selector strategies, accessibility trees, and Screen Object Model.

---

## 1. Selector Strategies Implementation

```typescript
import { remote } from 'webdriverio';

export async function demonstrateLocators(driver: WebdriverIO.Browser): Promise<void> {
  // 1. Accessibility ID (Cross-Platform Gold Standard)
  const loginBtn = await driver.$('~login_button');
  await loginBtn.click();

  // 2. iOS Class Chain (Fast hierarchical query)
  const navHeader = await driver.$(
    '-ios class chain:**/XCUIElementTypeNavigationBar/XCUIElementTypeStaticText[`label == "Dashboard"`]'
  );
  const headerText = await navHeader.getText();
  console.log('Nav Header:', headerText);

  // 3. iOS Predicate String (Fast native predicate)
  const submitBtn = await driver.$(
    '-ios predicate string:type == "XCUIElementTypeButton" AND name == "Submit" AND visible == 1'
  );
  await submitBtn.click();

  // 4. Android UiAutomator (Native Android selector)
  const settingsItem = await driver.$(
    'android=new UiSelector().text("Settings").className("android.widget.TextView")'
  );
  await settingsItem.click();

  // 5. Android UiScrollable (Dynamic scroll into view)
  const devOptions = await driver.$(
    'android=new UiScrollable(new UiSelector().scrollable(true)).scrollIntoView(new UiSelector().text("Developer Options"))'
  );
  await devOptions.click();

  // 6. Resource ID
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
- **Encapsulate in Screen Objects**: Structure tests into Screen Object Model classes with typed getters (see `skills/selenium-design-patterns`).
- **Avoid Recursive XPath**: Do not write deep absolute XPath queries (`/hierarchy/android.widget...`) on mobile trees.
- **Native Scroll with `UiScrollable`**: Use Android `UiScrollable` to scroll and locate in a single operation.
