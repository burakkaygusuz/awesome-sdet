# Vibium State & Recording Management — Java API Reference

> Vibium (v26.5.31) provides authentication state snapshots (`storageState`), session tracing, recording chunking/grouping, and multi-tab context isolation.

---

## 1. Storage State Snapshots

```java
package com.example.sdet.vibium;

import com.vibium.Vibium;
import com.vibium.Browser;
import com.vibium.Vibe;
import com.vibium.Element;
import java.util.Map;

public class StateManagementExample {
    public void persistAndRestoreState() {
        // Capture authenticated state snapshot
        try (Browser bro = Vibium.start()) {
            Vibe loginPage = bro.page();
            loginPage.go("https://app.example.com/login");

            Element userInput = loginPage.find("label=User");
            userInput.fill("admin");

            Element loginBtn = loginPage.find(Map.of("role", "button", "text", "Login"));
            loginBtn.click();

            bro.storageState("auth.json");
        }

        // Reuse storageState in new session to bypass UI login
        try (Browser authBro = Vibium.start(Map.of("storageState", "auth.json"))) {
            Vibe authPage = authBro.page();
            authPage.go("https://app.example.com/dashboard");
        }
    }
}
```

---

## 2. Multi-Tab Handling

```java
package com.example.sdet.vibium;

import com.vibium.Browser;
import com.vibium.Vibe;

public class MultiTabExample {
    public void handleTabs(Browser bro) {
        Vibe mainTab = bro.page();
        Vibe newTab = bro.newPage();
        newTab.go("https://app.example.com/docs");

        System.out.println("Open tab count: " + bro.pages().size());

        mainTab.bringToFront();
        newTab.close();
    }
}
```
