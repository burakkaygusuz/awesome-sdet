# Vibium State & Recording Management — Java API Reference (Vibium 26.x+)

> Official Vibium 26.5+ Java authentication state snapshots (`storageState`), session cookies, local storage serialization, session tracing, and multi-tab context isolation.

---

## 1. Storage State & Auth Snapshots

```java
package com.example.sdet.vibium;

import dev.vibium.Browser;
import dev.vibium.Element;
import dev.vibium.Vibe;
import dev.vibium.Vibium;
import java.util.Map;

public class StateManagementExample {
    public void persistAndRestoreState() {
        try (Vibe vibe = Vibium.launch()) {
            vibe.go("https://app.example.com/login");

            Element userInput = vibe.find(Map.of("label", "Username"));
            userInput.fill("admin");

            Element passInput = vibe.find(Map.of("label", "Password"));
            passInput.fill("SecureP@ss123");

            Element loginBtn = vibe.find(Map.of("role", "button", "text", "Sign In"));
            loginBtn.click();

            vibe.storageState(".auth/admin-state.json");
        }

        try (Vibe authVibe = Vibium.launch(Map.of("storageState", ".auth/admin-state.json"))) {
            authVibe.go("https://app.example.com/dashboard");
        }
    }
}
```

---

## 2. Multi-Tab & Page Management

```java
package com.example.sdet.vibium;

import dev.vibium.Vibe;

public class MultiTabExample {
    public void handleTabs(Vibe mainTab) {
        Vibe newTab = mainTab.newPage();
        newTab.go("https://app.example.com/docs");

        System.out.println("Open tab count: " + mainTab.pages().size());

        mainTab.bringToFront();
        newTab.close();
    }
}
```

---

## 3. Session Cookies & Local Storage Serialization

```java
package com.example.sdet.vibium;

import dev.vibium.Vibe;
import java.util.List;
import java.util.Map;

public class CookieAndStorageExample {
    public void manageState(Vibe vibe) {
        vibe.setCookies(List.of(
            Map.of(
                "name", "session_token",
                "value", "java_jwt_token_xyz",
                "domain", ".example.com",
                "path", "/",
                "httpOnly", true,
                "secure", true
            )
        ));

        System.out.println("Active cookies: " + vibe.cookies("https://app.example.com"));

        vibe.evaluate("() => localStorage.setItem('theme', 'dark')");

        vibe.clearCookies();
    }
}
```

---

## 4. Session Tracing & Recording (CLI v26.5.31)

```bash
# Start full video and BiDi event recording
vibium record start --video --output ./reports/session.zip

# Grouping subcommands (v26.5.31)
vibium record start-group --name "login-flow"
vibium go https://app.example.com/login
vibium record stop-group

# Chunking subcommands (v26.5.31)
vibium record start-chunk --name "checkout-step-1"
vibium click @e5
vibium record stop-chunk

# Finalize recording
vibium record stop
```

---

## 5. Best Practices

- **Never share storage state across concurrent workers**: Give each parallel worker thread its own isolated storage state file.
- **Use chunked recordings for long journeys**: Leverage `start-chunk` and `stop-chunk` to split large test runs into distinct debuggable archives.
- **Always close browser on teardown**: Auto-closeable `try (Vibe vibe = Vibium.launch())` blocks ensure deterministic session teardown and artifact flushing.
