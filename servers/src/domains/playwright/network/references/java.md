# Playwright Network Mocking & API Testing — Java Reference

> Official Playwright 1.62+ Java network interception (Page.route), request modification (route.resume), and APIRequestContext.

---

## 1. Network Interception & Mocking (`Page.route`)

```java
package com.example.playwright;

import java.util.HashMap;
import java.util.Map;
import com.microsoft.playwright.Page;
import com.microsoft.playwright.Route;

public class NetworkMockingExamples {
    public static void demonstrateMocking(Page page) {
        page.route("**/api/v1/user/profile", route -> {
            String mockProfileJson = "{\"id\": \"usr_42\", \"name\": \"Jane Doe\", \"role\": \"ADMIN\"}";
            route.fulfill(new Route.FulfillOptions()
                .setStatus(200)
                .setContentType("application/json")
                .setBody(mockProfileJson));
        });

        page.route("**/*analytics*/**", Route::abort);

        page.route("**/api/v1/secure/**", route -> {
            Map<String, String> headers = new HashMap<>(route.request().headers());
            headers.put("X-Mock-Authorization", "Bearer test-token-123");
            route.resume(new Route.ResumeOptions().setHeaders(headers));
        });

        page.unroute("**/api/v1/user/profile");
    }
}
```

---

## 2. HAR Replay

```java
package com.example.playwright;

import java.nio.file.Paths;
import com.microsoft.playwright.Page;

public class HarReplayExamples {
    public static void replayHar(Page page) {
        page.routeFromHAR(
            Paths.get("fixtures/har/checkout.har"),
            new Page.RouteFromHAROptions()
                .setUrl("**/api/checkout/**")
                .setUpdate(false)
        );
        page.navigate("/checkout");
    }
}
```

---

## 3. Pure API Testing with `APIRequestContext`

```java
package com.example.playwright;

import java.util.Map;
import com.microsoft.playwright.APIRequest;
import com.microsoft.playwright.APIRequestContext;
import com.microsoft.playwright.APIResponse;
import com.microsoft.playwright.Playwright;
import com.microsoft.playwright.options.RequestOptions;

public class ApiTestingExamples {
    public static void testApi(Playwright playwright) {
        APIRequestContext request = playwright.request().newContext(
            new APIRequest.NewContextOptions()
                .setBaseURL("https://api.example.com")
                .setExtraHTTPHeaders(Map.of("Authorization", "Bearer token-123"))
        );

        APIResponse createRes = request.post(
            "/api/v1/users",
            RequestOptions.create().setData(Map.of("username", "sdet_user", "email", "sdet@example.com"))
        );
        assert createRes.ok();
        assert createRes.status() == 201;

        APIResponse getRes = request.get("/api/v1/users/42");
        assert getRes.status() == 200;

        request.dispose();
    }
}
```

---

## 4. Synchronizing Actions with Network Responses

```java
package com.example.playwright;

import com.microsoft.playwright.Page;
import com.microsoft.playwright.Response;
import com.microsoft.playwright.options.AriaRole;

public class NetworkSyncExamples {
    public static void waitForResponseExample(Page page) {
        page.navigate("/cart");

        Response response = page.waitForResponse(
            res -> res.url().contains("/api/checkout") && res.status() == 200,
            () -> page.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions().setName("Place Order")).click()
        );

        assert response.ok();
    }
}
```
