# Vibium Interactions & Actionability — Java API Reference (Vibium 26.x+)

> Official Vibium 26.5+ Java auto-waiting interaction primitives, actionability checks, and pointer mechanics.

---

## 1. Interaction Methods

```java
package com.example.sdet.vibium;

import dev.vibium.Browser;
import dev.vibium.Element;
import dev.vibium.Vibe;
import dev.vibium.Vibium;
import java.util.Map;

public class InteractionsExample {
    public void executeInteractions(Vibe vibe) {
        Element loginBtn = vibe.find(Map.of("role", "button", "text", "Log In"));
        loginBtn.click();

        Element username = vibe.find(Map.of("label", "Username"));
        username.fill("admin");

        Element password = vibe.find(Map.of("label", "Password"));
        password.type("secret");
        password.press("Enter");

        System.out.println("Username value: " + username.value());

        Element roleSelect = vibe.find(Map.of("role", "combobox", "text", "Role"));
        roleSelect.select("ADMIN");

        Element agree = vibe.find(Map.of("label", "Terms"));
        agree.check();
        agree.uncheck();

        Element menuBtn = vibe.find(Map.of("testid", "menu-btn"));
        menuBtn.hover();
        menuBtn.highlight();
        System.out.println("Menu text: " + menuBtn.text());
        System.out.println("Menu bounds: " + menuBtn.bounds());

        Element source = vibe.find(Map.of("testid", "source-card"));
        Element target = vibe.find(Map.of("testid", "target-bin"));
        source.dragTo(target);
    }
}
```

---

## 2. Best Practices & Action Invariants

- **Zero Hardcoded Sleeps**: Eliminate `Thread.sleep()` entirely. Vibium auto-waits on the 6-point actionability pipeline.
- **Prefer `fill()` over `type()`**: Use `fill()` for deterministic form clearing and entry; reserve `type()` for physical keyboard event testing.
- **Clean Lifecycle Safety**: Wrap browser instances in try-with-resources blocks (`try (Vibe vibe = Vibium.launch())`) to guarantee daemon process teardown.
