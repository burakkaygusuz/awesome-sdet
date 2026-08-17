# Appium W3C Actions API & Mobile Gestures — TypeScript API Reference (Appium 2.x+)

> Official Appium 2.x & WebdriverIO v9+ TypeScript W3C Actions touch pointer gestures and mobile extensions.

---

## 1. W3C Pointer Action Gestures

```typescript
import { remote } from 'webdriverio';

export async function executeMobileGestures(driver: WebdriverIO.Browser): Promise<void> {
  await driver
    .action('pointer', { parameters: { pointerType: 'touch' } })
    .move({ x: 200, y: 400 })
    .down()
    .pause(100)
    .up()
    .perform();

  await driver
    .action('pointer', { parameters: { pointerType: 'touch' } })
    .move({ x: 250, y: 800 })
    .down()
    .pause(100)
    .move({ duration: 500, x: 250, y: 200 })
    .up()
    .perform();

  const sourceEl = await driver.$('~source_item');
  const targetEl = await driver.$('~target_dropzone');
  const sourceLoc = await sourceEl.getLocation();
  const sourceSize = await sourceEl.getSize();
  const targetLoc = await targetEl.getLocation();
  const targetSize = await targetEl.getSize();

  const sourceX = Math.round(sourceLoc.x + sourceSize.width / 2);
  const sourceY = Math.round(sourceLoc.y + sourceSize.height / 2);
  const targetX = Math.round(targetLoc.x + targetSize.width / 2);
  const targetY = Math.round(targetLoc.y + targetSize.height / 2);

  await driver
    .action('pointer', { parameters: { pointerType: 'touch' } })
    .move({ x: sourceX, y: sourceY })
    .down()
    .pause(500)
    .move({ duration: 800, x: targetX, y: targetY })
    .up()
    .perform();
}
```

---

## 2. Platform-Specific Mobile Execute Commands

```typescript
export async function executeNativeDriverGestures(driver: WebdriverIO.Browser): Promise<void> {
  await driver.execute('mobile: scrollGesture', {
    left: 100,
    top: 100,
    width: 400,
    height: 600,
    direction: 'down',
    percent: 0.75,
  });

  await driver.execute('mobile: swipe', {
    direction: 'left',
  });
}
```

---

## 3. Best Practices & Invariants

- **Standard W3C Actions**: Do not use deprecated `TouchAction` APIs.
- **Relative Coordinates**: Calculate coordinates dynamically from `getLocation()` and `getSize()` rather than hardcoded pixel values.
- **Settle Pauses**: Insert 100ms pauses between `down()` and `move()` for gesture recognition on high refresh rate displays.
