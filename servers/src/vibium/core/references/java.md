# Vibium Core & CLI Architecture — Java API Reference

> Vibium (v26.5.31) is an AI-native browser automation framework built on W3C WebDriver BiDi, unifying the Sense-Think-Act agent loop, `@ref` element mapping, and multi-language client libraries.

---

## 1. Maven Dependency

```xml
<dependency>
    <groupId>com.vibium</groupId>
    <artifactId>vibium</artifactId>
    <version>26.5.31</version>
</dependency>
```

---

## 2. Browser Lifecycle & Setup

```java
package com.example.sdet.vibium;

import com.vibium.Vibium;
import com.vibium.Browser;
import com.vibium.Vibe;
import com.vibium.Element;

public class VibiumCoreExample {
    public static void main(String[] args) {
        // Auto-closeable session ensures deterministic browser cleanup
        try (Browser bro = Vibium.start()) {
            Vibe vibe = bro.page();
            vibe.go("https://app.example.com");

            System.out.println("Page Title: " + vibe.evaluate("() -> document.title"));

            Element submitBtn = vibe.find("button");
            submitBtn.click();
        }
    }
}
```

---

## 3. Sense-Think-Act Execution Loop

```java
package com.example.sdet.vibium;

import com.vibium.Vibium;
import com.vibium.Browser;
import com.vibium.Vibe;
import com.vibium.Element;
import java.util.Map;

public class AgentLoop {
    public void executeSenseThinkAct() {
        try (Browser bro = Vibium.start()) {
            Vibe vibe = bro.page();
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
