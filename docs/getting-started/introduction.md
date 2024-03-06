---
title: Introduction
description: uikit brings user interfaces to @react-three/fiber
nav: 0
---

![uikit banner](./banner.jpg)

Build declarative UIs with support for nested scroll, buttons, inputs, dropdowns, tabs, checkboxes, and more.

> Perfect for games, XR (VR/AR), and, of course, Spatial Computing Apps.

```bash
npm install three @react-three/fiber @react-three/uikit
```

### What does it look like ?

| A simple UI with 2 containers in a row rendered in fullscreen that changes their opacity when the user hovers over them. | ![render of the above code](./basic-example.gif) |
| ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |

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

## Pre-Styled Component Kits

Install the source code of themeable components from available kits into your repository using the `uikit cli`.

| <h3>default</h3> _based on [Shadcn](https://github.com/shadcn-ui/ui)_ | <h3>apfel</h3> _inspired by AVP_                            |
| --------------------------------------------------------------------- | ----------------------------------------------------------- |
| ![Overview over all Default components](./default-overview.jpg)                                                                      | ![Overview over all Apfel components](./apfel-overview.jpg) |
| [View All Components](../kits/default.md)                             | [View All Components](../kits/apfel.md)                     |
| `npx uikit component add default Button`                                  | `npx uikit component add apfel Button`                          |

## How to get started ?

The tutorials expect some familiarity with react, threejs, and @react-three/fiber.

1. Build your [First Layout](./first-layout.md)
2. Learn about the [Available Components and Their Properties](./components-and-properties.md)
3. Get inspired by our [Examples](./examples.md)
4. Learn more about  
— [Interacitivity](../tutorials/interactivity.md)  
— Using [Custom Materials](../tutorials/custom-materials.md)  
— Using [Custom Fonts](../tutorials/fonts.md)  
— Creating [Responsivene User Interfaces](../tutorials/responsive.md)  
— [Scrolling](../tutorials/scroll.md)  
— [Sizing](../tutorials/sizing.md)
5. Learn about [Common Pitfalls]() and how to [Optimize Performance]()

### Migration guides

- from [Koestlich](../migration/from-koestlich.md)
- from [HTML/CSS](../migration/from-html-css.md)
- from [Tailwind](../migration/from-tailwind.md)