# Appium Mobile Locator Strategies — JavaScript API Reference (Appium 2.x+)

> Official Appium 2.x WebdriverIO JavaScript selector strategies, accessibility trees, and platform query engines.

---

## 1. Selector Strategies Implementation

```javascript
const { remote } = require('webdriverio');

async function findAndInteract(driver) {
  const cartIcon = await driver.$('~cart_icon');
  await cartIcon.click();

  const cellItem = await driver.$(
    '-ios class chain:**/XCUIElementTypeCell[`name BEGINSWITH "Item"`]'
  );
  await cellItem.click();

  const enabledBtn = await driver.$(
    '-ios predicate string:type == "XCUIElementTypeButton" AND enabled == 1'
  );
  await enabledBtn.click();

  const switchToggle = await driver.$(
    'android=new UiSelector().className("android.widget.Switch").checked(false)'
  );
  await switchToggle.click();

  const searchField = await driver.$('id=com.example.app:id/search_query');
  await searchField.setValue('Appium Automation');
}
```

---

## 2. Best Practices & Invariants

- **Prefix-Based Selectors**: WebdriverIO interprets `~` as Accessibility ID and `android=` as UiAutomator.
- **Avoid Absolute XPaths**: Always replace fragile XML XPaths with Class Chains or Predicates.

## Image Locator

- Image-based locator for canvas UIs without semantic attributes: the `-image` prefix in WebdriverIO selectors (e.g. `$('-image:path/to/element.png')`) (requires the Appium images plugin).
