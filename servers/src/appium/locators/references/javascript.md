# Appium Mobile Locator Strategies — JavaScript API Reference (Appium 3.6.0+)

> Official Appium 3.6.0+ WebdriverIO JavaScript selector strategies, accessibility trees, and platform query engines.

---

## 1. Selector Strategies Implementation

```javascript
const { remote } = require('webdriverio');

async function findAndInteract(driver) {
  // Accessibility ID
  const cartIcon = await driver.$('~cart_icon');
  await cartIcon.click();

  // iOS Class Chain
  const cellItem = await driver.$(
    '-ios class chain:**/XCUIElementTypeCell[`name BEGINSWITH "Item"`]'
  );
  await cellItem.click();

  // iOS Predicate String
  const enabledBtn = await driver.$(
    '-ios predicate string:type == "XCUIElementTypeButton" AND enabled == 1'
  );
  await enabledBtn.click();

  // Android UiAutomator
  const switchToggle = await driver.$(
    'android=new UiSelector().className("android.widget.Switch").checked(false)'
  );
  await switchToggle.click();

  // Resource ID
  const searchField = await driver.$('id=com.example.app:id/search_query');
  await searchField.setValue('Appium Automation');
}
```

---

## 2. Best Practices & Invariants

- **Prefix-Based Selectors**: WebdriverIO interprets `~` as Accessibility ID and `android=` as UiAutomator.
- **Avoid Absolute XPaths**: Always replace fragile XML XPaths with Class Chains or Predicates.
