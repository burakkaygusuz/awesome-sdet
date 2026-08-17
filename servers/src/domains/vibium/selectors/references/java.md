# Vibium Selectors & Locators — Java API Reference (Vibium 26.x+)

> Official Vibium 26.5+ Java semantic locators, open Shadow DOM piercing combinators, and scoped element queries.

---

## 1. Semantic Locator Strategies (`vibe.find`)

```java
package com.example.sdet.vibium;

import dev.vibium.Browser;
import dev.vibium.Element;
import dev.vibium.Vibe;
import dev.vibium.Vibium;
import java.util.Map;

public class SelectorsExample {
    public void testSelectors() {
        try (Vibe vibe = Vibium.launch()) {
            Element button = vibe.find(Map.of("role", "button", "text", "Sign In"));
            button.click();

            Element email = vibe.find(Map.of("label", "Email Address"));
            email.fill("test@example.com");
            String emailValue = email.value();

            Element badge = vibe.find(Map.of("testid", "item-count"));
            String badgeCount = badge.text();

            Element search = vibe.find(Map.of("placeholder", "Search..."));
            search.fill("Java SDET");

            Element confirmation = vibe.find(Map.of("text", "Welcome"));
            confirmation.waitFor();
        }
    }
}
```

---

## 2. Pierce Combinators (`>>` and `>>>`)

| Combinator | Behavior                                                                               | Example                                                                       |
| :--------- | :------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------- |
| **`>>`**   | **Single Boundary Piercing** — Crosses host element shadow root or enters an iframe.   | `vibe.find("user-card >> button.edit")` / `vibe.find("iframe#auth >> input")` |
| **`>>>`**  | **Deep Shadow DOM Piercing** — Pierces across open Shadow Root boundaries recursively. | `vibe.find("app-drawer >>> nav-menu >>> button#logout")`                      |

```java
package com.example.sdet.vibium;

import dev.vibium.Element;
import dev.vibium.Vibe;
import dev.vibium.Vibium;

public class ShadowDomPiercing {
    public void testPiercing() {
        try (Vibe vibe = Vibium.launch()) {
            Element editButton = vibe.find("user-card >> button.edit");
            editButton.click();

            Element shadowBtn = vibe.find("app-drawer >>> nav-menu >>> button#logout");
            shadowBtn.click();

            Element frameInput = vibe.find("iframe#payment-frame >> input#card-number");
            frameInput.fill("4242424242424242");
        }
    }
}
```

---

## 3. Subtree Scoping & Multi-Element Collections (`find`, `findAll`)

```java
package com.example.sdet.vibium;

import dev.vibium.Element;
import dev.vibium.Vibe;
import dev.vibium.Vibium;
import java.util.List;
import java.util.Map;

public class SubtreeScoping {
    public void testScoping() {
        try (Vibe vibe = Vibium.launch()) {
            Element row = vibe.find(Map.of("role", "row", "text", "Alice"));
            Element editBtn = row.find(Map.of("role", "button", "text", "Edit"));
            editBtn.click();

            List<Element> allRows = vibe.findAll(Map.of("role", "row"));

            for (Element r : allRows) {
                List<Element> actionBtns = r.findAll("button");
            }
        }
    }
}
```

---

## 4. Best Practices & Priority Hierarchy

1. **`find(Map.of("role", "...", "text", "..."))` / `find(Map.of("label", "..."))`**: User-facing accessibility contracts.
2. **`find(Map.of("testid", "..."))`**: Dedicated QA contract (`data-testid`).
3. **`find(Map.of("text", "..."))` / `find(Map.of("placeholder", "..."))`**: Content matching.
4. **`>>>` Piercing / `>>` Iframe**: Complex shadow root boundaries and embedded frames.
5. Avoid raw XPath or brittle CSS paths (`div > div:nth-child(3) > span`).
