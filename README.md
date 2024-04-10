<h1>uikit</h1>

[![Version](https://img.shields.io/npm/v/@react-three/uikit?style=flat&colorA=000000&colorB=000000)](https://npmjs.com/package/@react-three/uikit)
[![Downloads](https://img.shields.io/npm/dt/@react-three/uikit.svg?style=flat&colorA=000000&colorB=000000)](https://npmjs.com/package/@react-three/uikit)
[![Twitter](https://img.shields.io/twitter/follow/pmndrs?label=%40pmndrs&style=flat&colorA=000000&colorB=000000&logo=twitter&logoColor=000000)](https://twitter.com/pmndrs)
[![Discord](https://img.shields.io/discord/740090768164651008?style=flat&colorA=000000&colorB=000000&label=discord&logo=discord&logoColor=000000)](https://discord.gg/ZZjjNvJ)

![uikit banner](./docs/getting-started/banner.jpg)

Build performant 3D user interfaces for **Three.js** using **@react-three/fiber** and **yoga** with support for nested scrolling, buttons, inputs, dropdowns, tabs, checkboxes, and more.

> Perfect for games, XR (VR/AR), and any web-based Spatial Computing App.

```bash
npm install three @react-three/fiber @react-three/uikit
```

### What does it look like?

| A simple UI with 2 containers horizontally aligned, rendered in fullscreen. When the user hovers over a container, the container's opacity changes. | ![render of the above code](./docs/getting-started/basic-example.gif) |
| --------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |

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

We provide multiple kits containing **themable pre-styled components**. Inspired by shadcn, you can use our CLI to install the source code of any component to your desired loaction with one command.

> For example, to add the button from the default kit, run: `npx uikit component add default Button`

| <h3>default</h3> _based on [Shadcn](https://github.com/shadcn-ui/ui)_                | <h3>apfel</h3> _inspired by AVP_                                                 |
| ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| ![Overview over all default components](./docs/getting-started/default-overview.jpg) | ![Overview over all apfel components](./docs/getting-started/apfel-overview.jpg) |
| [View All Components](https://docs.pmnd.rs/uikit/kits/default)                       | [View All Components](https://docs.pmnd.rs/uikit/kits/apfel)                     |
| `npx uikit component add default Button`                                             | `npx uikit component add apfel Button`                                           |

## How to get started?

> Some familiarity with
> react, threejs, and @react-three/fiber, is recommended.

Get started with **[building your first layout](https://docs.pmnd.rs/uikit/getting-started/first-layout)**, take a look at our **[examples](https://docs.pmnd.rs/uikit/getting-started/examples)** to see uikit in action, or learn more about:

- [All components and their properties](https://docs.pmnd.rs/uikit/getting-started/components-and-properties)
- [Interactivity](https://docs.pmnd.rs/uikit/tutorials/interactivity)
- [Custom materials](https://docs.pmnd.rs/uikit/tutorials/custom-materials)
- [Custom fonts](https://docs.pmnd.rs/uikit/tutorials/custom-fonts)
- [Responsive user interfaces](https://docs.pmnd.rs/uikit/tutorials/responsive)
- [Scrolling](https://docs.pmnd.rs/uikit/tutorials/scroll)
- [Sizing](https://docs.pmnd.rs/uikit/tutorials/sizing)
- [Common pitfalls](https://docs.pmnd.rs/uikit/advanced/pitfalls)
- [Optimize performance](https://docs.pmnd.rs/uikit/advanced/performance)
- [Theming components](https://docs.pmnd.rs/uikit/kits/theming)

## Migration Guides

- from [Koestlich](https://docs.pmnd.rs/uikit/migration/from-koestlich)
- from [HTML/CSS](https://docs.pmnd.rs/uikit/migration/from-html-css)
- from [Tailwind](https://docs.pmnd.rs/uikit/migration/from-tailwind)
