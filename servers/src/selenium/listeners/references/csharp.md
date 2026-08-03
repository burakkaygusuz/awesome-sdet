# Selenium Event Listeners — C# API Reference (Selenium 4.46.0+)

> Official Selenium 4 C# EventFiringWebDriver (`OpenQA.Selenium.Support.Events.EventFiringWebDriver`).

---

## Code Examples

```csharp
using OpenQA.Selenium;
using OpenQA.Selenium.Support.Events;

public class ListenerExamples
{
    public void DemonstrateListener(IWebDriver originalDriver)
    {
        var firingDriver = new EventFiringWebDriver(originalDriver);

        firingDriver.FindingElement += (sender, e) =>
        {
            Console.WriteLine($"Finding element: {e.FindMethod}");
        };

        firingDriver.ElementClicked += (sender, e) =>
        {
            Console.WriteLine($"Clicked element: {e.Element}");
        };
    }
}
```

## Best Practices

- **Unsubscribe Events**: Always detach event handlers (`FindingElement -= ...`) in teardown/dispose methods.
- **Non-blocking Operations**: Keep event handlers fast to avoid adding latency to command dispatch.
- **Wrap Target Driver**: Pass the base `IWebDriver` instance into `EventFiringWebDriver` before test setup.
