<h1>@ni2khanna/uikit</h1>

[![Version](https://img.shields.io/npm/v/@ni2khanna/uikit?style=flat&colorA=000000&colorB=000000)](https://npmjs.com/package/@ni2khanna/uikit)
[![Downloads](https://img.shields.io/npm/dt/@ni2khanna/uikit.svg?style=flat&colorA=000000&colorB=000000)](https://npmjs.com/package/@ni2khanna/uikit)

![uikit banner](./docs/getting-started/banner.jpg)

Build performant 3D user interfaces for **Three.js** using **yoga** with support for nested scrolling, buttons, inputs, dropdowns, tabs, checkboxes, and more. A vanilla-first toolkit with React Three Fiber support.

> Perfect for games, XR (VR/AR), and any web-based Spatial Computing App.

```bash
npm install three @ni2khanna/uikit
```

### What does it look like ?

| A simple UI with 2 containers horizontally aligned, rendered in fullscreen. When the user hovers over a container, the container's opacity changes. | ![render of the above code](./docs/getting-started/basic-example.gif) |
| --------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |

```jsx
import { PerspectiveCamera, Scene, WebGLRenderer } from 'three'
import { reversePainterSortStable, Container, Root } from '@ni2khanna/uikit'

const camera = new PerspectiveCamera(70, 1, 0.01, 100)
camera.position.z = 10

const scene = new Scene()

const canvas = document.getElementById('root') as HTMLCanvasElement

const renderer = new WebGLRenderer({ antialias: true, canvas })

const root = new Root(camera, renderer, {
    flexDirection: "row",
    padding: 10,
    gap: 10,
    width: 1000,
    height: 500
})
scene.add(root)
const c1 = new Container({
    flexGrow: 1,
    opacity: 0.5,
    hover: { opacity: 1 }
    backgroundColor: "red"
})
root.add(c1)
const c2 = new Container({
    flexGrow: 1,
    opacity: 0.5,
    hover: { opacity: 1 },
    backgroundColor: "blue"
})
root.add(c2)

renderer.setAnimationLoop(animation)
renderer.localClippingEnabled = true
renderer.setTransparentSort(reversePainterSortStable)

function updateSize() {
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(window.devicePixelRatio)
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
}

updateSize()
window.addEventListener('resize', updateSize)

let prev: number | undefined
function animation(time: number) {
  const delta = prev == null ? 0 : time - prev
  prev = time

  root.update(delta)

  renderer.render(scene, camera)
}

```

## Events

Events such a hovering require an additional event system that dispatches pointerover, ... events into the scene. More on this later ...
