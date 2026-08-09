# Appium W3C Actions API & Mobile Gestures — C# API Reference (Appium 3.6.0+)

> Official Appium 3.6.0+ .NET Client (`PointerInputDevice`, `ActionSequence`) touch gestures and mobile execute scripts.

---

## 1. W3C Pointer Input Gestures

```csharp
using System;
using System.Collections.Generic;
using System.Drawing;
using OpenQA.Selenium.Appium;
using OpenQA.Selenium.Interactions;

namespace AwesomeSdet.Appium
{
    public static class AppiumGestureActions
    {
        public static void Swipe(AppiumDriver driver, Point start, Point end, int durationMs = 500)
        {
            var touch = new PointerInputDevice(PointerKind.Touch, "touch");
            var sequence = new ActionSequence(touch, 0);

            sequence.AddAction(touch.CreatePointerMove(CoordinateOrigin.Viewport, start.X, start.Y, TimeSpan.Zero));
            sequence.AddAction(touch.CreatePointerDown(MouseButton.Left));
            sequence.AddAction(touch.CreatePause(TimeSpan.FromMilliseconds(100)));
            sequence.AddAction(touch.CreatePointerMove(CoordinateOrigin.Viewport, end.X, end.Y, TimeSpan.FromMilliseconds(durationMs)));
            sequence.AddAction(touch.CreatePointerUp(MouseButton.Left));

            driver.PerformActions(new List<ActionSequence> { sequence });
        }
    }
}
```

---

## 2. Platform-Specific Mobile Execute Scripts

```csharp
namespace AwesomeSdet.Appium
{
    public static class AppiumPlatformGestures
    {
        public static void MobileScrollAndroid(AppiumDriver driver, string elementId)
        {
            var scriptArgs = new Dictionary<string, object>
            {
                { "elementId", elementId },
                { "direction", "down" },
                { "percent", 0.75 }
            };
            driver.ExecuteScript("mobile: scrollGesture", scriptArgs);
        }
    }
}
```

---

## 3. Best Practices & Invariants

- **Use `PerformActions`**: Submit gestures via `driver.PerformActions()`.
- **Coordinate Origin**: Use `CoordinateOrigin.Viewport` for screen coordinate movements.
