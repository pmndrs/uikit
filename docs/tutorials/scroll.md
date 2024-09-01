---
title: Scrolling
description: How to use overflow, scrolling, and clipping.
nav: 7
---

uikit handles clipping and scrolling out of the box by specifying `overflow="scroll"` or `overflow="hidden"` on any UI element.

However, it is required to configure three.js to support visual clipping, which is done via

```jsx
<Canvas gl={{ localClippingEnabled: true }}>
```

## onScroll

If a `Container` component uses `overflow="scroll"`, the `onScroll` event is called when the user scrolls through their scroll wheel or touching. `onScroll` receives the new `x` and `y` coordinates for the scroll position, the signal containing the current `scrollPosition`, and the optional event that caused the scrolling. The listener passed to `onScroll` can return `false` to prevent setting the new `x` and `y` scroll position.

## Scrollbars

uikit renders scrollbars if the content overflows an element that has the property `overflow="scroll"`. The scrollbar can be styled similarly to the background panel of any component via the following properties.

| Property                         | Type                |
| -------------------------------- | ------------------- |
| scrollbarPanelMaterialClass      | Material class      |
| scrollbarBackgroundOpacity       | number              |
| scrollbarBackgroundColor         | ColorRepresentation |
| scrollbarWidth                   | number              |
| scrollbarBorderRadius            | number              |
| scrollbarBorderLeftRadius        | number              |
| scrollbarBorderRightRadius       | number              |
| scrollbarBorderTopRadius         | number              |
| scrollbarBorderBottomRadius      | number              |
| scrollbarBorderTopLeftRadius     | number              |
| scrollbarBorderTopRightRadius    | number              |
| scrollbarBorderBottomRightRadius | number              |
| scrollbarBorderBottomLeftRadius  | number              |
