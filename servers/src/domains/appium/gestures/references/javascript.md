# Appium W3C Actions API & Mobile Gestures — JavaScript API Reference (Appium 2.x+)

> Official Appium 2.x WebdriverIO JavaScript W3C Actions touch gestures and script extensions.

---

## 1. W3C Pointer Gestures Implementation

```javascript
async function performMobileGestures(driver) {
  await driver
    .action('pointer', { parameters: { pointerType: 'touch' } })
    .move({ x: 300, y: 500 })
    .down()
    .pause(50)
    .up()
    .perform();

  await driver
    .action('pointer', { parameters: { pointerType: 'touch' } })
    .move({ x: 300, y: 500 })
    .down()
    .pause(1500)
    .up()
    .perform();

  await driver
    .action('pointer', { parameters: { pointerType: 'touch' } })
    .move({ x: 900, y: 500 })
    .down()
    .pause(100)
    .move({ duration: 400, x: 100, y: 500 })
    .up()
    .perform();
}
```

---

## 2. Platform-Specific Execute Scripts

```javascript
async function executePlatformScripts(driver) {
  await driver.execute('mobile: scroll', {
    direction: 'down',
    predicateString: 'label == "Target Cell"',
  });
}
```

---

## 3. Best Practices & Invariants

- **Always Call `.perform()`**: Action builder sequences must be terminated with `.perform()`.
- **W3C Actions Compliance**: Use `action('pointer', ...)` for multi-step touch interactions.
