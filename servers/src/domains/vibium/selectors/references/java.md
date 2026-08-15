# Vibium Selectors & Locators — Java API Reference (Vibium 26.x+)

> Vibium (v26.5.31) provides high-resilience semantic locators, open Shadow DOM piercing combinators (`>>`, `>>>`), and chainable locator scoping.

---

## 1. Semantic Locator Strategies (`vibe.find`)

```java
package com.example.sdet.vibium;

import com.vibium.Browser;
import com.vibium.Element;
import com.vibium.Page;
import com.vibium.Vibium;
import com.vibium.types.SelectorOptions;

public class SelectorsExample {
    public void testSelectors() {
        Browser bro = Vibium.start();
        Page vibe = bro.page();

        Element button = vibe.find(new SelectorOptions().role("button").text("Sign In"));
        button.click();

        Element email = vibe.find(new SelectorOptions().label("Email Address"));
        email.fill("test@example.com");

        Element badge = vibe.find(new SelectorOptions().testid("item-count"));

        Element confirmation = vibe.find(new SelectorOptions().text("Welcome"));
        Element search = vibe.find(new SelectorOptions().placeholder("Search..."));
        search.fill("Java SDET");
    }
}
```

---

## 2. Pierce Combinators (`>>` and `>>>`)

```java
package com.example.sdet.vibium;

import com.vibium.Browser;
import com.vibium.Page;
import com.vibium.Vibium;

public class ShadowDomPiercing {
    public void testPiercing() {
        Browser bro = Vibium.start();
        Page vibe = bro.page();

        Element editButton = vibe.find("user-card >> button.edit");
        editButton.click();

        Element shadowBtn = vibe.find("app-drawer >>> nav-menu >>> button#logout");
        shadowBtn.click();
    }
}
```

---

## 3. Subtree Scoping & Chaining

```java
package com.example.sdet.vibium;

import com.vibium.Browser;
import com.vibium.Element;
import com.vibium.Page;
import com.vibium.Vibium;
import com.vibium.types.SelectorOptions;

public class SubtreeScoping {
    public void testScoping() {
        Browser bro = Vibium.start();
        Page vibe = bro.page();

        Element row = vibe.find(new SelectorOptions().role("row").text("Alice"));
        Element editBtn = row.find(new SelectorOptions().role("button").text("Edit"));
        editBtn.click();
    }
}
```
