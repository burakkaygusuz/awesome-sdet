# Vibium Selectors & Locators — Java API Reference (Vibium 26.x+)

> Vibium (v26.5.31) provides high-resilience semantic locators, open Shadow DOM piercing combinators (`>>`, `>>>`), and chainable locator scoping.

---

## 1. Semantic Locator Strategies (`vibe.find`)

```java
package com.example.sdet.vibium;

import com.vibium.Vibe;
import com.vibium.Element;
import java.util.Map;

public class SelectorsExample {
    public void testSelectors(Vibe vibe) {
        Element button = vibe.find(Map.of("role", "button", "text", "Sign In"));
        button.click();

        Element email = vibe.find("label=Email Address");
        email.fill("test@example.com");

        Element badge = vibe.find("testid=item-count");

        Element confirmation = vibe.find("text=Welcome");
        Element search = vibe.find("placeholder=Search...");
        search.fill("Java SDET");
    }
}
```

---

## 2. Pierce Combinators (`>>` and `>>>`)

```java
package com.example.sdet.vibium;

import com.vibium.Vibe;
import com.vibium.Element;

public class ShadowDomPiercing {
    public void testPiercing(Vibe vibe) {
        Element formBtn = vibe.find("form.login-form >> button[type='submit']");
        formBtn.click();

        // '>>>' pierces nested Web Components across open Shadow Root boundaries
        Element shadowBtn = vibe.find("app-drawer >>> nav-menu >>> button#logout");
        shadowBtn.click();
    }
}
```

---

## 3. Subtree Scoping & Chaining

```java
package com.example.sdet.vibium;

import com.vibium.Vibe;
import com.vibium.Element;
import java.util.Map;

public class SubtreeScoping {
    public void testScoping(Vibe vibe) {
        Element row = vibe.find(Map.of("role", "row", "text", "Alice"));
        Element editBtn = row.find(Map.of("role", "button", "text", "Edit"));
        editBtn.click();
    }
}
```
