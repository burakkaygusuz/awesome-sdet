# Java Reference — WebDriver BiDirectional Protocol

```java
import org.openqa.selenium.bidi.module.LogInspector;
import org.openqa.selenium.bidi.module.Network;
import org.openqa.selenium.bidi.browsingcontext.BrowsingContext;

// LogInspector example
LogInspector inspector = new LogInspector(driver);
inspector.onConsoleEntry(entry -> System.out.println(entry.getText()));

// Network example
Network network = new Network(driver);
network.addIntercept(new AddInterceptParameters(InterceptPhase.BEFORE_REQUEST_SENT));
```
