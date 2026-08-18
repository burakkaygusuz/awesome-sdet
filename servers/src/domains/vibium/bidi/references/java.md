# Vibium BiDi Protocol & Network Routing — Java API Reference (Vibium 26.x+)

> Official Vibium 26.5+ Java WebDriver BiDi protocol, network routing, event listeners, and clock virtualization.

---

## 1. Network Interception (`vibe.route`)

```java
package com.example.sdet.vibium;

import dev.vibium.Vibe;

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

import dev.vibium.Vibe;

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

import dev.vibium.Vibe;

public class ClockVirtualization {
    public void adjustClock(Vibe vibe) {
        vibe.clock().install();
        vibe.clock().fastForward(15000);
    }
}
```

---

## 4. Best Practices

- **Isolate Network Dependencies**: Stub third-party analytics and unstable microservices using `vibe.route()`.
- **BiDi Telemetry**: Capture runtime browser errors by listening to `pageerror` and `console` event streams.
- **Fast-Forward Virtual Time**: Use `vibe.clock().fastForward()` for deterministic delay testing instead of `Thread.sleep()`.
