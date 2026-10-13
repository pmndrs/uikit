<h1>pmndrs/uikit</h1>

[![Version](https://img.shields.io/npm/v/@pmndrs/uikit?style=flat&colorA=000000&colorB=000000)](https://npmjs.com/package/@pmndrs/uikit)
[![Downloads](https://img.shields.io/npm/dt/@pmndrs/uikit.svg?style=flat&colorA=000000&colorB=000000)](https://npmjs.com/package/@pmndrs/uikit)
[![Twitter](https://img.shields.io/twitter/follow/pmndrs?label=%40pmndrs&style=flat&colorA=000000&colorB=000000&logo=twitter&logoColor=000000)](https://twitter.com/pmndrs)
[![Discord](https://img.shields.io/discord/740090768164651008?style=flat&colorA=000000&colorB=000000&label=discord&logo=discord&logoColor=000000)](https://discord.gg/ZZjjNvJ)

![uikit banner](https://raw.githubusercontent.com/pmndrs/uikit/main/docs/getting-started/banner.jpg)

Build performant 3D user interfaces for **Three.js** using **yoga** with support for nested scrolling, buttons, inputs, dropdowns, tabs, checkboxes, and more.

> Perfect for games, XR (VR/AR), and any web-based Spatial Computing App.

```bash
npm install three @pmndrs/uikit @pmndrs/pointer-events
```

```ts
import { Container, reversePainterSortStable } from '@pmndrs/uikit'
import { forwardHtmlEvents } from '@pmndrs/pointer-events'

renderer.localClippingEnabled = true
renderer.setTransparentSort(reversePainterSortStable)

const root = new Container({ sizeX: 8, sizeY: 4, flexDirection: 'row', padding: 10, gap: 10 })
root.add(new Container({ flexGrow: 1, backgroundColor: 'red', opacity: 0.5, hover: { opacity: 1 } }))
root.add(new Container({ flexGrow: 1, backgroundColor: 'blue', opacity: 0.5, hover: { opacity: 1 } }))
scene.add(root)

const events = forwardHtmlEvents(canvas, camera, scene)
let prev = performance.now()
renderer.setAnimationLoop((time) => {
  events.update()
  root.update(time - prev)
  prev = time
  renderer.render(scene, camera)
})
```

Learn more in the [vanilla three.js guide](https://pmndrs.github.io/uikit/docs/getting-started/vanilla) and the [documentation](https://pmndrs.github.io/uikit/docs). For React Three Fiber, use [@react-three/uikit](https://npmjs.com/package/@react-three/uikit).
