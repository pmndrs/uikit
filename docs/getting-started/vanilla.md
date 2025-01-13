---
title: Vanilla Three.js
description: Build your first layout with with uikit and vanilla threejs.
nav: 4
---

The vanilla version of uikit allows to build user interfaces with plain Three.js.

### Differences to @react-three/uikit

The vanilla version of uikit (`@pmndrs/uikit`) is decoupled from react. Therefore features such providing defaults via context is not available. Furthermore, no event system is available out of the box. For interactivity, such as hover effects, developers have to attach their own event system by emitting pointer events to the UI elements:

```js
uiElement.dispatchEvent({
    type: 'pointerover',
    distance: 0,
    nativeEvent: {} as any,
    object: x,
    point: new Vector3(),
    pointerId: -1,
})
```

Aside from interactivity and contexts, every feature is available.

## Building a user interface with `@pmndrs/uikit`

The first step is to install the dependencies.

`npm i three @pmndrs/uikit`

Next, we create the `index.js` file and import the necessary dependencies and setup a threejs scene.

```js
import { PerspectiveCamera, Scene, WebGLRenderer } from 'three'
import { reversePainterSortStable, Container, Root } from '@pmndrs/uikit'

const camera = new PerspectiveCamera(70, 1, 0.01, 100)
camera.position.z = 10
const scene = new Scene()
const canvas = document.getElementById('root') as HTMLCanvasElement
const renderer = new WebGLRenderer({ antialias: true, canvas })
```

Now, we can start defining the actual layout. Every layout must start with a `Root` element (or an element that wraps the `Root` element, such as the `Fullscreen` component). In this example, the `Root` is of size 2 by 1 (three.js units). The `Root` has a horizontal (row) flex-direction, with 2 `Container` children, filling its width equally with a margin around them.

More in-depth information on the Flexbox properties can be found [here](https://yogalayout.dev/docs/).

```js
const root = new Root(camera, renderer, undefined, {
    flexDirection: "row",
    padding: 10,
    gap: 10
})
scene.add(root)

const defaultProperties = {
    backgroundOpacity: 0.5,
}

const container1 = new Container(
    {
        flexGrow: 1,
        hover: { backgroundOpacity: 1 }
        backgroundColor: "red"
    },
    defaultProperties
)
root.add(container1)

const container2 = new Container(
    {
        flexGrow: 1,
        backgroundOpacity: 0.5,
        hover: { backgroundOpacity: 1 },
        backgroundColor: "blue"
    },
    defaultProperties
)
root.add(container2)
```

All properties of the user interface elements can be modified using `container.setProperties({...})`. The last step is to setup the frameloop, setup resizing, enable local clipping, and setup the transparency sort required for uikit. Notice that the root component needs to be updated every frame using `root.update(delta)`.

```js
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

If you use vite (`npm i vite`), you can create a `index.html` file, add the following content, and run `npx vite`.

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
    <script type="module" src="index.jsx"></script>
  </head>
  <body style="margin: 0;">
    <div id="root" style="width: 100dvw; height: 100dvh;"></div>
  </body>
</html>
```

The result should look like this

![Two containers in a row layout - one red and one blue with hover effects](./basic-example.gif)

### Disposing

Call `destroy()` on elements to free resources:

```js
root.destroy()
```

