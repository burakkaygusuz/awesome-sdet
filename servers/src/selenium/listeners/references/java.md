# Java Reference — EventFiringDecorator & WebDriverListener

```java
import org.openqa.selenium.support.events.WebDriverListener;
import org.openqa.selenium.support.events.EventFiringDecorator;

public class CustomListener implements WebDriverListener {
    @Override
    public void beforeClick(WebElement element) {
        System.out.println("Clicking " + element);
    }
}

WebDriver decorated = new EventFiringDecorator<>(new CustomListener()).decorate(driver);
```
