# Selenium ExpectedConditions Full Method Reference

| Method                                                                     | Return Type        | Description                                                                       |
| :------------------------------------------------------------------------- | :----------------- | :-------------------------------------------------------------------------------- |
| `alertIsPresent()`                                                         | `Alert`            | Expectation for checking that an alert is present.                                |
| `and(ExpectedCondition<?>... conditions)`                                  | `Boolean`          | Logical **AND** condition of the given list of conditions.                        |
| `attributeContains(By locator, String attribute, String value)`            | `Boolean`          | Checks if the attribute of the element found by locator contains specific value.  |
| `attributeContains(WebElement element, String attribute, String value)`    | `Boolean`          | Checks if the attribute of the given element contains specific value.             |
| `attributeToBe(By locator, String attribute, String value)`                | `Boolean`          | Checks if the attribute of the element found by locator has a specific value.     |
| `attributeToBe(WebElement element, String attribute, String value)`        | `Boolean`          | Checks if the attribute of the given element has a specific value.                |
| `attributeToBeNotEmpty(WebElement element, String attribute)`              | `Boolean`          | Checks if the attribute of the given element has any non-empty value.             |
| `domAttributeToBe(WebElement element, String attribute, String value)`     | `Boolean`          | Checks if the given element has a DOM attribute with a specific value.            |
| `domPropertyToBe(WebElement element, String property, String value)`       | `Boolean`          | Checks if the given element has a DOM property with a specific value.             |
| `elementSelectionStateToBe(By locator, boolean selected)`                  | `Boolean`          | Checks if the element found by locator is in the specified selection state.       |
| `elementSelectionStateToBe(WebElement element, boolean selected)`          | `Boolean`          | Checks if the given element is in the specified selection state.                  |
| `elementToBeClickable(By locator)`                                         | `WebElement`       | Checks if an element is visible and enabled such that it can be clicked.          |
| `elementToBeClickable(WebElement element)`                                 | `WebElement`       | Checks if the given element is visible and enabled such that it can be clicked.   |
| `elementToBeSelected(By locator)`                                          | `Boolean`          | Checks if the element found by locator is selected.                               |
| `elementToBeSelected(WebElement element)`                                  | `Boolean`          | Checks if the given element is selected.                                          |
| `frameToBeAvailableAndSwitchToIt(int frameIndex)`                          | `WebDriver`        | Checks if a frame with given index is available and switches to it.               |
| `frameToBeAvailableAndSwitchToIt(String frameLocator)`                     | `WebDriver`        | Checks if a frame with given locator is available and switches to it.             |
| `frameToBeAvailableAndSwitchToIt(By locator)`                              | `WebDriver`        | Checks if a frame found by locator is available and switches to it.               |
| `frameToBeAvailableAndSwitchToIt(WebElement frame)`                        | `WebDriver`        | Checks if the given frame element is available and switches to it.                |
| `invisibilityOf(WebElement element)`                                       | `Boolean`          | Checks that the element is invisible.                                             |
| `invisibilityOfAllElements(List<WebElement> elements)`                     | `Boolean`          | Checks that all elements in the list are invisible.                               |
| `invisibilityOfAllElements(WebElement... elements)`                        | `Boolean`          | Checks that all provided elements are invisible.                                  |
| `invisibilityOfElementLocated(By locator)`                                 | `Boolean`          | Checks that an element is either invisible or not present on the DOM.             |
| `invisibilityOfElementWithText(By locator, String text)`                   | `Boolean`          | Checks that an element with specific text is invisible or not present.            |
| `javaScriptThrowsNoExceptions(String javaScript)`                          | `Boolean`          | Checks if the provided JavaScript executes without exceptions.                    |
| `jsReturnsValue(String javaScript)`                                        | `Object`           | Expectation for a value to be returned from JavaScript execution.                 |
| `not(ExpectedCondition<?> condition)`                                      | `Boolean`          | Logical **NOT** (opposite) condition of the given condition.                      |
| `numberOfElementsToBe(By locator, Integer count)`                          | `List<WebElement>` | Checks that the number of elements matching the locator equals the count.         |
| `numberOfElementsToBeLessThan(By locator, Integer count)`                  | `List<WebElement>` | Checks that the number of elements is less than the specified count.              |
| `numberOfElementsToBeMoreThan(By locator, Integer count)`                  | `List<WebElement>` | Checks that the number of elements is more than the specified count.              |
| `numberOfWindowsToBe(int count)`                                           | `Boolean`          | Checks that the number of windows/tabs is equal to the specified count.           |
| `or(ExpectedCondition<?>... conditions)`                                   | `Boolean`          | Logical **OR** condition of the given list of conditions.                         |
| `presenceOfAllElementsLocatedBy(By locator)`                               | `List<WebElement>` | Checks that there is at least one element present on the page.                    |
| `presenceOfElementLocated(By locator)`                                     | `WebElement`       | Checks that an element is present on the DOM of a page.                           |
| `presenceOfNestedElementLocatedBy(By locator, By childLocator)`            | `WebElement`       | Checks for a parent element to have a child with the given locator.               |
| `presenceOfNestedElementLocatedBy(WebElement element, By childLocator)`    | `WebElement`       | Checks for a given parent element to contain a child with the given locator.      |
| `presenceOfNestedElementsLocatedBy(By parent, By childLocator)`            | `List<WebElement>` | Checks for a parent element to have children with the given locator.              |
| `refreshed(ExpectedCondition<T> condition)`                                | `T`                | Wrapper that allows elements to update by redrawing (handling Staleness).         |
| `stalenessOf(WebElement element)`                                          | `Boolean`          | Waits until an element is no longer attached to the DOM.                          |
| `textMatches(By locator, Pattern pattern)`                                 | `Boolean`          | Checks if the element's text matches the given regular expression.                |
| `textToBe(By locator, String value)`                                       | `Boolean`          | Checks if the element's text is exactly the specified value.                      |
| `textToBePresentInElement(WebElement element, String text)`                | `Boolean`          | Checks if the given text is present in the specified element.                     |
| `textToBePresentInElementLocated(By locator, String text)`                 | `Boolean`          | Checks if the given text is present in the element matching the locator.          |
| `textToBePresentInElementValue(By locator, String value)`                  | `Boolean`          | Checks if the given text is present in the element's `value` attribute.           |
| `textToBePresentInElementValue(WebElement element, String value)`          | `Boolean`          | Checks if the given text is present in the specified element's `value` attribute. |
| `titleContains(String title)`                                              | `Boolean`          | Checks that the page title contains a case-sensitive substring.                   |
| `titleIs(String title)`                                                    | `Boolean`          | Checks that the page title matches the expected string exactly.                   |
| `urlContains(String fraction)`                                             | `Boolean`          | Checks that the current URL contains specific text.                               |
| `urlMatches(String regex)`                                                 | `Boolean`          | Checks that the current URL matches a specific regular expression.                |
| `urlMatches(Pattern pattern)`                                              | `Pattern`          | Checks that the current URL matches a specific `Pattern` object.                  |
| `urlToBe(String url)`                                                      | `Boolean`          | Checks that the current URL is exactly the specified string.                      |
| `visibilityOf(WebElement element)`                                         | `WebElement`       | Checks that an element, known to be present, is visible.                          |
| `visibilityOfAllElements(List<WebElement> elements)`                       | `List<WebElement>` | Checks that all elements in the provided list are visible.                        |
| `visibilityOfAllElements(WebElement... elements)`                          | `List<WebElement>` | Checks that all provided elements are visible.                                    |
| `visibilityOfAllElementsLocatedBy(By locator)`                             | `List<WebElement>` | Checks that all elements matching the locator are visible.                        |
| `visibilityOfElementLocated(By locator)`                                   | `WebElement`       | Checks that an element is present on the DOM and visible.                         |
| `visibilityOfNestedElementsLocatedBy(By parent, By childLocator)`          | `List<WebElement>` | Checks all child elements inside the parent element to be visible.                |
| `visibilityOfNestedElementsLocatedBy(WebElement element, By childLocator)` | `List<WebElement>` | Checks child elements within a parent element to be visible.                      |
