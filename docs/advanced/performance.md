---
title: Performance
description: Important considerations for building performant user interfaces with uikit.
nav: 12
---

## Avoid React Re-renders

When frequently changing properties of uikit components and especially when animating properties on every frame. We recommend modifying properties using `ref.current.setStyle` or using a signal.

### using `ref.current.setStyle`

This approach is similar to html/css. The following code shows how to animate the background opacity on every frame without interfering with react.

```jsx showLineNumbers
import { Container } from '@react-three/uikit'
import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { signal } from '@preact/signals-core'

export function AnimateBackground() {
    const ref = useRef()
    useFrame(({ clock }) => {
        //continuously animate between 0 and 1
        ref.current.setStyle({ opacity: Math.sin(clock.getElapsedTime()) / 2 + 0.5 })
    })
    return <Container ref={ref} backgroundOpacity={0}></Container>
}
```

Setting executing `setStyle(undefined, true)` resets all changes back to the initial properties provided to the directly to the component.

### using signals

This approach is similar to react-spring and allows to modify the properties of a uikit component without any property diffing. The following code shows how to animate the background opacity on every frame without interfering with react.

```jsx showLineNumbers
import { Container } from '@react-three/uikit'
import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { signal } from '@preact/signals-core'

export function AnimateBackground() {
    const opacity = useMemo(() => signal(0), []);
    useFrame(({ clock }) => {
        //continuously animate between 0 and 1
        opacity.value = Math.sin(clock.getElapsedTime()) / 2 + 0.5
    })
    return <Container backgroundOpacity={opacity}></Container>
}
```

## Avoid Custom MaterialClasses

The amount of different Material Classes used, directly influences the amount the draw calls. For every new material class, a new draw call has to be on every render. Therefore, we recommend using as little as possible different custom material classes.

## Avoid Many Font Families

Like the material classes, each new font family directly results in one additional draw call. Therefore, minimizing the amount of font families is recommended for GPU Performance.