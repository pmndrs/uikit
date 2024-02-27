<h1>uikit</h1>

[![Version](https://img.shields.io/npm/v/@react-three/uikit?style=flat&colorA=000000&colorB=000000)](https://npmjs.com/package/@react-three/uikit)
[![Downloads](https://img.shields.io/npm/dt/@react-three/uikit.svg?style=flat&colorA=000000&colorB=000000)](https://npmjs.com/package/@react-three/uikit)
[![Twitter](https://img.shields.io/twitter/follow/pmndrs?label=%40pmndrs&style=flat&colorA=000000&colorB=000000&logo=twitter&logoColor=000000)](https://twitter.com/pmndrs)
[![Discord](https://img.shields.io/discord/740090768164651008?style=flat&colorA=000000&colorB=000000&label=discord&logo=discord&logoColor=000000)](https://discord.gg/ZZjjNvJ)

Full ui component kit with nested scroll, buttons, inputs, dropdowns, tabs, checkboxes etc. only rendered directly in webgl/threejs.

> Perfect for games, XR (VR/AR) and of course Spatial Computing Apps.

```bash
npm install three @react-three/fiber @react-three/uikit
```
### What does it look like ?

|A simple UI with 2 containers in a row rendered in fullscreen that change their opacity when the use hovers over them them.|![render of the above code](./basic-example.gif)|
|-|-|

```jsx
import { createRoot } from 'react-dom/client'
import React from 'react'
import { Canvas } from '@react-three/fiber'
import { Fullscreen, Container } from '@react-three/uikit'

createRoot(document.getElementById('root')).render(
  <Canvas>
    <Fullscreen flexDirection="row" padding={100} gap={100}>
      <Container flexGrow={1} backgroundOpacity={0.5} hover={{ backgroundOpacity: 1 }} backgroundColor="red" />
      <Container flexGrow={1} backgroundOpacity={0.5} hover={{ backgroundOpacity: 1 }} backgroundColor="blue" />
    </Fullscreen>
  </Canvas>,
)
```


### I need pre-styled components !

| <h3>Shadcn Default</h3> *based on [Shadcn]()*                 | ... |
| ------------------------------- | --- |
| ![]()                           | -   |
| [View All Components]()             | -   |
| `uikit add default {Component}` | -   |

## How to get started ?

The tutorials expect some level of familarity with react, threejs, and @react-three/fiber.

1. Build your [First Layout](./first-layout.md)
2. Learn about the [Available Components and Their Properties](./components-and-properties.md)
3. Get inspired by our [Examples](./examples.md)
4. Learn more about
- Using [Custom Materials](../tutorials/custom-materials.mdx)
- Using [Custom Fonts](../tutorials/fonts.mdx)
- Creating [Responsivene User Interfaces](../tutorials/responsive.mdx)
- [Scrolling](../tutorials/scroll.mdx)
- [Sizing](../tutorials/sizing.mdx
)
5. Learn about [Common Pitfalls]() and how to [Optimize Performance]()

## Migration guides

- from [Koestlich](../migration/from-koestlich.mdx)
- from HTML/CSS
- from Tailwind

