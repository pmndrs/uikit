---
title: Interactivity
description: How to make the UI elements interactive.
nav: 7
---

Every UI component can receive the same events as [any other R3F element](https://docs.pmnd.rs/react-three-fiber/api/events). In addition to these event listeners, uikit provides properties such as `hover` and `active` for all components. These properties allow the element to overwrite other properties if it is hovered or clicked.

The following example shows a Root element that is `black` by default turns `red` when the user hovers and is `green` as long as the user clicks on it.

```jsx
<Root
  backgroundColor="black"
  hover={{ backgroundColor: 'red' }}
  active={{ backgroundColor: 'green' }}
  sizeX={1}
  sizeY={1}
/>
```

![Screenrecoding of the interacitivity of the previous example](./interactivity.gif)
