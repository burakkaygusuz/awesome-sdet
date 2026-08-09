---
name: appium-gestures-actions
description: 'Master mobile touch gestures and W3C Actions API: tap, long press, swipe, scroll, drag and drop, pinch-zoom, and native mobile execution commands.'
user-invocable: true
license: MIT
compatibility: Appium 3.6.0+ / W3C Actions
metadata:
  framework: appium
  keywords:
    - appium
    - w3c-actions
    - pointer-input
    - touch-gestures
    - swipe-scroll
    - drag-drop
    - pinch-zoom
---

# Appium Mobile Touch Gestures & W3C Actions API

## 1. What Is It?

The W3C Actions API is the standardized specification for dispatching virtual pointer and touch events (down, move, pause, up) across mobile devices in Appium 3.6.0+.

## 2. Core Capabilities & Responsibilities

- **W3C PointerInput API**: Constructs low-level touch sequences with sub-millisecond precision for multi-touch gestures.
- **Fundamental Touch Actions**: Single Tap, Double Tap, Long Press (with duration pause), and Point-to-Point Swipes.
- **Complex Multi-Touch Sequences**: Drag and Drop between UI components, and Two-Finger Pinch-to-Zoom.
- **Platform-Specific Extensions**: High-performance native script execution commands (`mobile: scrollGesture`, `mobile: swipe`, `mobile: dragGesture`, `mobile: pinch`).
- **W3C Standard Foundation**: Shares the core W3C Actions virtual device model (`PointerInput`, `Sequence`, `ActionBuilder`) standardized by Selenium/WebDriver.

## 3. Why Use It?

Replaces legacy, deprecated `TouchAction` APIs with the official W3C WebDriver standard, ensuring cross-platform stability and preventing breaking driver changes across iOS and Android updates.

## 4. Best Practices & Anti-Patterns

| Best Practice                                                                                                           | Anti-Pattern                                                                                                |
| :---------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------- |
| **Use Standard W3C Actions**: Construct touch sequences using `PointerInput(TOUCH)`.                                    | **Deprecated `TouchAction`**: Using legacy `TouchAction` removed in Appium 2.0/3.0.                         |
| **Calculate Relative Coordinates**: Compute coordinates dynamically from element bounding boxes.                        | **Hardcoded Screen Pixels**: Hardcoding absolute pixel coordinates breaking across device resolutions.      |
| **Include Settle Pauses in Gestures**: Add 100ms pause between `pointerDown` and `pointerMove` for gesture recognition. | **Zero-Duration Instant Jumps**: Moving pointers with zero duration resulting in unrecognized swipe flings. |
| **Use Native `mobile:` Scroll for Massive Lists**: Leverage driver native gesture scripts for heavy scroll feeds.       | **Looping Single-Pixel Swipes**: Running hundreds of micro-swipes inside unbuffered client loops.           |

## 5. Cross-Framework References

- **Desktop W3C Actions**: For desktop mouse/keyboard action chains, see [Selenium Actions API](file:///Users/burak/Documents/GitHub/awesome-sdet/skills/selenium-actions-api/SKILL.md) and `selenium://actions/{language}`.

## 6. Dynamic Tool Schemas & API Reference

Fetch language-specific code implementations and API schemas using the `sdet-mcp` tool:

- **Tool**: `read_appium_gestures_docs`
- **Parameters**: `gesture` (`tap` | `double_tap` | `long_press` | `swipe` | `scroll` | `drag_and_drop` | `pinch_zoom`), `language` (`typescript` | `javascript` | `python` | `java` | `csharp`)
- **Resource URI**: `appium://gestures/{language}`
