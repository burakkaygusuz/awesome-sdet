# Java Reference — Actions API

```java
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.Keys;

Actions actions = new Actions(driver);
actions.moveToElement(element).contextClick().perform();
actions.dragAndDrop(source, target).perform();
actions.keyDown(Keys.CONTROL).sendKeys("a").keyUp(Keys.CONTROL).perform();
```
