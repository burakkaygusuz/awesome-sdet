# Vibium Core & CLI Architecture — Java API Reference (Vibium 26.x+)

> Official Vibium 26.5+ Java browser lifecycle, launch options, and Sense-Think-Act CLI architecture.

---

## 1. Browser Lifecycle & Setup

```java
package com.example.sdet.vibium;

import dev.vibium.Browser;
import dev.vibium.Element;
import dev.vibium.Vibe;
import dev.vibium.Vibium;

public class VibiumCoreExample {
    public static void main(String[] args) {
        try (Vibe vibe = Vibium.launch()) {
            vibe.go("https://app.example.com");
            vibe.evaluate("() => document.title");

            Element submitBtn = vibe.find("button");
            submitBtn.click();
        }
    }
}
```

---

## 2. Sense-Think-Act Execution Loop

```java
package com.example.sdet.vibium;

import dev.vibium.Element;
import dev.vibium.Vibe;
import dev.vibium.Vibium;
import java.util.Map;

public class AgentLoop {
    public void executeSenseThinkAct() {
        try (Vibe vibe = Vibium.launch()) {
            vibe.go("https://app.example.com/login");

            Element emailInput = vibe.find(Map.of("role", "textbox", "text", "Email"));
            emailInput.fill("sdet@example.com");

            Element submitBtn = vibe.find(Map.of("role", "button", "text", "Sign In"));
            submitBtn.click();

            vibe.check("verify user lands on dashboard");
        }
    }
}
```

---

## 3. Best Practices

- **AutoCloseable Teardown**: Always use `try-with-resources` (`try (Vibe vibe = Vibium.launch())`) to guarantee `vibe.quit()` executes upon block exit.
- **Zero Arbitrary Sleeps**: Rely on Vibium's built-in actionability auto-waiting on element interactions.
- **Semantic Contracts**: Prioritize role and text attribute maps over brittle CSS or XPath strings.
