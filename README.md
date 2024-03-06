<h1>uikit</h1>

[![Version](https://img.shields.io/npm/v/@react-three/uikit?style=flat&colorA=000000&colorB=000000)](https://npmjs.com/package/@react-three/uikit)
[![Downloads](https://img.shields.io/npm/dt/@react-three/uikit.svg?style=flat&colorA=000000&colorB=000000)](https://npmjs.com/package/@react-three/uikit)
[![Twitter](https://img.shields.io/twitter/follow/pmndrs?label=%40pmndrs&style=flat&colorA=000000&colorB=000000&logo=twitter&logoColor=000000)](https://twitter.com/pmndrs)
[![Discord](https://img.shields.io/discord/740090768164651008?style=flat&colorA=000000&colorB=000000&label=discord&logo=discord&logoColor=000000)](https://discord.gg/ZZjjNvJ)

![uikit banner](./docs/getting-started/banner.jpg)

Build declarative UIs with support for nested scrolling, buttons, inputs, dropdowns, tabs, checkboxes, and more.

> Perfect for games, XR (VR/AR), and, of course, Spatial Computing Apps.

```bash
npm install three @react-three/fiber @react-three/uikit
```

### What does it look like ?

| A simple UI rendered in fullscreen with 2 containers arranged in a row changing their opacity when the user hovers over them. | ![render of the above code](./docs/getting-started/basic-example.gif) |
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
| ![Overview over all Default components](./docs//getting-started/default-overview.jpg)                                                                      | ![Overview over all Apfel components](./docs//getting-started/apfel-overview.jpg) |
| [View All Components]()                             | [View All Components]()                     |
| `npx uikit component add default Button`                                  | `npx uikit component add apfel Button`                          |

## How to get started ?

The tutorials expect some familiarity with react, threejs, and @react-three/fiber.

- Build your [First Layout](https://docs.pmnd.rs/uikit/getting-started/first-layout)
- Learn about the [Available Components and Their Properties](https://docs.pmnd.rs/uikit/getting-started/components-and-properties)
- Get inspired by our [Examples](https://docs.pmnd.rs/uikit/getting-started/examples)
- Learn more about  
  - [Interacitivity](https://docs.pmnd.rs/uikit/tutorials/interactivity)  
  - Using [Custom Materials](https://docs.pmnd.rs/uikit/tutorials/custom-materials)  
  - Using [Custom Fonts](https://docs.pmnd.rs/uikit/tutorials/custom-fonts)  
  - Creating [Responsivene User Interfaces](https://docs.pmnd.rs/uikit/tutorials/responsive)  
  - [Scrolling](https://docs.pmnd.rs/uikit/tutorials/scroll)  
  - [Sizing](https://docs.pmnd.rs/uikit/tutorials/sizing)
- Learn about [Common Pitfalls](https://docs.pmnd.rs/uikit/advanced/pitfalls) and how to [Optimize Performance](https://docs.pmnd.rs/uikit/advanced/performance)

## Migration guides

- from [Koestlich](https://docs.pmnd.rs/uikit/migration/from-koestlich)
- from [HTML/CSS](https://docs.pmnd.rs/uikit/migration/from-html-css)
- from [Tailwind](https://docs.pmnd.rs/uikit/migration/from-tailwind)