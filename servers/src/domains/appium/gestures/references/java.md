# Appium W3C Actions API & Mobile Gestures — Java API Reference (Appium 3.x+)

> Official Appium 3.6.0+ Java Client (`PointerInput`, `Sequence`) W3C Actions touch gestures and mobile execute scripts.

---

## 1. W3C PointerInput Touch Gestures

```java
package com.example.sdet.appium;

import io.appium.java_client.AppiumDriver;
import org.openqa.selenium.Point;
import org.openqa.selenium.interactions.Pause;
import org.openqa.selenium.interactions.PointerInput;
import org.openqa.selenium.interactions.Sequence;

import java.time.Duration;
import java.util.Collections;
import java.util.Map;

public class AppiumGestureActions {
    public static void swipe(AppiumDriver driver, Point start, Point end, Duration duration) {
        PointerInput finger = new PointerInput(PointerInput.Kind.TOUCH, "finger");
        Sequence swipe = new Sequence(finger, 1);

        swipe.addAction(finger.createPointerMove(Duration.ZERO, PointerInput.Origin.viewport(), start.x, start.y));
        swipe.addAction(finger.createPointerDown(PointerInput.MouseButton.LEFT.asArg()));
        swipe.addAction(new Pause(finger, Duration.ofMillis(100)));
        swipe.addAction(finger.createPointerMove(duration, PointerInput.Origin.viewport(), end.x, end.y));
        swipe.addAction(finger.createPointerUp(PointerInput.MouseButton.LEFT.asArg()));

        driver.perform(Collections.singletonList(swipe));
    }
}
```

---

## 2. Platform-Specific Mobile Execute Scripts

```java
public class AppiumPlatformGestures {
    public static void mobileScrollAndroid(AppiumDriver driver, String elementId) {
        driver.executeScript("mobile: scrollGesture", Map.of(
            "elementId", elementId,
            "direction", "down",
            "percent", 0.75
        ));
    }

    public static void mobileSwipeIOS(AppiumDriver driver, String direction) {
        driver.executeScript("mobile: swipe", Map.of(
            "direction", direction
        ));
    }
}
```

---

## 3. Best Practices & Invariants

- **Standard W3C Actions**: Do not use deprecated `io.appium.java_client.TouchAction`.
- **Thread Safety**: Pass driver instances dynamically rather than holding static mutable references.
