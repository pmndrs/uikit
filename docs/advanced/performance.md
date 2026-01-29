---
title: Performance
description: Important considerations for building performant user interfaces with uikit.
nav: 12
---

## Avoid Unnecessary Property Updates

When frequently changing properties of uikit components and especially when animating properties on every frame, we recommend modifying properties using `setStyle` or using a signal.

### using `setStyle`

This approach is similar to html/css. The following code shows how to animate the background color on every frame.

```ts
import { Container } from '@ni2khanna/uikit'
import { signal } from '@preact/signals-core'

const container = new Container({
  backgroundColor: 'rgba(255, 255, 255, 0)',
})

// In your animation loop:
function animate(time: number) {
  const opacity = Math.sin(time * 0.001) / 2 + 0.5
  container.setStyle({ backgroundColor: `rgba(255, 255, 255, ${opacity})` })
}
```

Calling `setStyle(undefined, true)` resets all changes back to the initial properties provided directly to the component.

### using signals

This approach allows modifying properties of a uikit component without any property diffing. The following code shows how to animate the background color on every frame.

```ts
import { Container } from '@ni2khanna/uikit'
import { signal } from '@preact/signals-core'

const backgroundColor = signal('rgba(255, 255, 255, 0)')

const container = new Container({
  backgroundColor,
})

// In your animation loop:
function animate(time: number) {
  backgroundColor.value = `rgba(255, 255, 255, ${Math.sin(time * 0.001) / 2 + 0.5})`
}
```

## Avoid Custom MaterialClasses

The amount of different Material Classes used, directly influences the amount the draw calls. For every new material class, a new draw call has to be on every render. Therefore, we recommend using as little as possible different custom material classes.

## Avoid Many Font Families

Like the material classes, each new font family directly results in one additional draw call. Therefore, minimizing the amount of font families is recommended for GPU Performance.
