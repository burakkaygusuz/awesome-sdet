# Vibium Interactions & Actionability — Java API Reference (Vibium 26.x+)

> Vibium (v26.5.31) automatically performs comprehensive actionability checks before executing any interaction, preventing race conditions and test flakiness.

---

## 1. Interaction Primitives

```java
package com.example.sdet.vibium;

import com.vibium.Vibe;
import com.vibium.Element;
import java.util.Map;

public class InteractionsExample {
    public void executeInteractions(Vibe vibe) {
        Element loginBtn = vibe.find(Map.of("role", "button", "text", "Log In"));
        loginBtn.click();

        // fill(): atomic value replacement; type(): sequential keystrokes
        Element username = vibe.find("label=Username");
        username.fill("admin");

        Element password = vibe.find("label=Password");
        password.type("secret");

        password.press("Enter");

        // Idempotent checkbox state toggles
        Element agree = vibe.find("label=Terms");
        agree.check();
        agree.uncheck();

        Element menuBtn = vibe.find("testid=menu-btn");
        menuBtn.hover();
        menuBtn.highlight();

        Element source = vibe.find("testid=source-card");
        Element target = vibe.find("testid=target-bin");
        source.dragTo(target);
    }
}
```
