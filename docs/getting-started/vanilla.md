---
title: Vanilla Three.js
description: Build your first layout with uikit and vanilla threejs.
nav: 4
---

The vanilla version of uikit allows to build user interfaces with plain Three.js.

### Differences to @react-three/uikit

The vanilla version of uikit (`@pmndrs/uikit`) is the core part of uikit while the react version is a slim wrapper around it. Therefore all features that are available in react are available in vanilla threejs. The only difference is that, since three.js ships no event system, no event system is available out of the box. For interactivity, such as hover effects, attach a pointer event system that emits W3C-compatible events to your UI elements. We recommend [@pmndrs/pointer-events](https://github.com/pmndrs/xr/tree/main/packages/pointer-events#readme).

## The uikit `Component`

All uikit components have a common base class (`Component`), which exposes a set of common properties and functions that allow to access internals and extend uikit's functionality to your use case.

### Properties

| Name                           | Type                                      | Description                                                       |
| ------------------------------ | ----------------------------------------- | ----------------------------------------------------------------- |
| `handlers`                     | `ReadonlySignal<EventHandlersProperties>` | Readonly event handlers attached to the component.                |
| `orderInfo`                    | `Signal<OrderInfo, undefined>`            | Render and layout ordering metadata.                              |
| `isVisible`                    | `Signal<boolean>`                         | Whether the component is currently visible after layout/clipping. |
| `isClipped`                    | `Signal<boolean>`                         | Whether the component is clipped by an ancestor.                  |
| `boundingSphere`               | `Sphere`                                  | World-space bounds used for culling and hit testing.              |
| `properties`                   | `Properties<OutProperties>`               | Computed, resolved properties (e.g. margins, padding, colors).    |
| `starProperties`               | `Properties<OutProperties>`               | Internal resolved properties snapshot.                            |
| `node`                         | `FlexNode`                                | Underlying Yoga flexbox node.                                     |
| `size`                         | `Signal<Vector2Tuple,undefined>`          | Current layout size; populated after an `update`.                 |
| `relativeCenter`               | `Signal<Vector2Tuple,undefined>`          | Center within local panel coordinates.                            |
| `borderInset`                  | `Signal<Inset,undefined>`                 | Computed border insets.                                           |
| `overflow`                     | `Signal<Overflow>`                        | Overflow behavior for children.                                   |
| `displayed`                    | `Signal<boolean>`                         | Whether the component participates in rendering.                  |
| `scrollable`                   | `Signal<[boolean, boolean]>`              | Horizontal/vertical scrollability flags.                          |
| `paddingInset`                 | `Signal<Inset,undefined>`                 | Computed padding insets.                                          |
| `maxScrollPosition`            | `Signal<Partial<Vector2Tuple>>`           | Maximum scroll positions.                                         |
| `root`                         | `Signal<RootContext>`                     | Root context reference.                                           |
| `parentContainer`              | `Signal<Container,undefined>`             | Parent container, if any.                                         |
| `hoveredList`                  | `Signal<Array<number>>`                   | Internal hover id stack.                                          |
| `activeList`                   | `Signal<Array<number>>`                   | Internal active id stack.                                         |
| `ancestorsHaveListenersSignal` | `Signal<boolean>`                         | Whether any ancestor listens for events.                          |
| `globalMatrix`                 | `Signal<Matrix4, undefined>`              | World transform.                                                  |
| `globalPanelMatrix`            | `Signal<Matrix4,undefined>`               | Panel-space world transform.                                      |
| `abortSignal`                  | `AbortSignal`                             | Abort signal tied to this component's lifecycle.                  |
| `classList`                    | `ClassList`                               | Utility to add/remove CSS-like classes.                           |

### Methods

- `setProperties(inputProperties: InProperties<OutProperties>): void` — update/extend the component's properties; triggers re-layout as needed.
- `resetProperties(inputProperties?: InProperties<OutProperties>): void` — reset properties to defaults (optionally applying new inputs).
- `update(delta: number): void` — advance layout and internal state by `delta` milliseconds.
- `dispose(): void` — free resources held by the component.

### Key points

- Call `update(delta)` only on the root component (the one whose parent is a non‑uikit object, e.g. a Three.js `Object3D`).
- Use `setProperties(...)` to extend or edit current properties; values are merged with inherited defaults and will be reflected after the next `update`.
- Read `size` to get the computed layout size of a component after an `update`.
- Use `properties` to inspect computed values such as margins and padding.

## Building a user interface with `@pmndrs/uikit`

The first step is to install the dependencies.

```bash
pnpm add three @pmndrs/uikit
```

Next, create the `index.ts` file and import the necessary dependencies and set up a threejs scene.

```ts
import { PerspectiveCamera, Scene, WebGLRenderer } from 'three'
import { reversePainterSortStable, Container } from '@pmndrs/uikit'

const camera = new PerspectiveCamera(70, 1, 0.01, 100)
camera.position.z = 10
const scene = new Scene()
const canvas = document.getElementById('root') as HTMLCanvasElement
const renderer = new WebGLRenderer({ antialias: true, canvas })
```

Now, we can start defining the actual layout. In this example, the `Container` is of size 8 by 4 (three.js units). The `Container` has a horizontal (row) flex-direction, with 2 `Container` children, filling its width equally with a margin around them.

More in-depth information on the Flexbox properties can be found [here](https://yogalayout.dev/docs/).

```ts
// Root container – add it to the scene; call root.update in your loop
const root = new Container({
  backgroundColor: "red",
  sizeX: 8,
  sizeY: 4,
  flexDirection: "row",
})
scene.add(root)

const container1 = new Container({
  flexGrow: 1,
  margin: 32,
  backgroundColor: "green",
})
root.add(container1)

const container2 = new Container({
  flexGrow: 1,
  margin: 32,
  backgroundColor: "blue",
})
root.add(container2)
```

All properties of the user interface elements can be modified using `container.setProperties({...})`. The last step is to setup the frameloop, setup resizing, enable local clipping, and setup the transparency sort required for uikit. Notice that the root component needs to be updated every frame using `root.update(delta)`.

```ts
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

If you use Vite, install and run it:

```bash
pnpm add -D vite
pnpm vite
```

Create an `index.html` file, add the following content:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
    <script type="module" src="index.ts"></script>
  </head>
  <body style="margin: 0;">
    <div id="root" style="width: 100dvw; height: 100dvh;"></div>
  </body>
</html>
```

The result should look like this

![Two containers in a row layout - one red and one blue with hover effects](./basic-example.gif)

### Disposing

Call `dispose()` on elements to free resources (non recursive):

```js
root.dispose()
```
