# Vibium BiDi Protocol & Network Routing — Java API Reference

> Vibium (v26.5.31) leverages the W3C WebDriver BiDi standard to provide high-performance network interception, live browser event listening, and clock virtualization.

---

## 1. Network Interception (`vibe.route`)

```java
package com.example.sdet.vibium;

import com.vibium.Vibe;

public class NetworkMockingExample {
    public void configureRoutes(Vibe vibe) {
        vibe.route("**/api/user", route -> {
            route.fulfill(200, "application/json", "{\"username\": \"java_sdet\", \"role\": \"admin\"}");
        });

        vibe.route("**/*.jpg", route -> route.abort());
    }
}
```

---

## 2. Event Listeners

```java
package com.example.sdet.vibium;

import com.vibium.Vibe;

public class BiDiListeners {
    public void attachListeners(Vibe vibe) {
        vibe.on("console", msg -> System.out.println("Console: " + msg));
        vibe.on("pageerror", err -> System.err.println("Page Error: " + err));
    }
}
```

---

## 3. Clock Virtualization

```java
package com.example.sdet.vibium;

import com.vibium.Vibe;

public class ClockVirtualization {
    public void adjustClock(Vibe vibe) {
        vibe.clock().install();
        vibe.clock().fastForward(15000);
    }
}
```
