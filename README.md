<p align="center">
  <img src="./docs/getting-started/logo.svg" width="100" />
</p>

<h1 align="center">@ni2khanna/uikit</h1>
<h3 align="center">Build performant 3D user interfaces for Three.js using vanilla TypeScript and yoga.</h3>
<br/>

> A vanilla-first 3D UI toolkit with React Three Fiber support. Perfect for games, XR (VR/AR), and any web-based Spatial Computing App.

```bash
npm install three @ni2khanna/uikit
```

## What is this?

This is a fork of [`@pmndrs/uikit`](https://github.com/pmndrs/uikit) — the excellent 3D UI toolkit built by [Poimandres](https://github.com/pmndrs) and originally authored by [Bela Bohlender](https://github.com/bbohlender).

This fork is a **vanilla-first** UIKit that also supports React Three Fiber:

- **Vanilla TypeScript core** — the core library is pure vanilla TypeScript, usable with any Three.js setup without a framework dependency. React Three Fiber bindings are available as an optional integration.
- **WebGPU renderer support** — a dual material path (GLSL `onBeforeCompile` for WebGL, TSL node materials for WebGPU) enables the library to work with both `WebGLRenderer` and `WebGPURenderer` (Three.js r182+).
- **Vanilla examples** — all examples are written in vanilla TypeScript, demonstrating the imperative API directly.

## Packages

| Package | Description |
|---|---|
| `@ni2khanna/uikit` | Core library — layout, rendering, text, interactions |
| `@ni2khanna/uikit-default` | Pre-styled component kit based on [Shadcn](https://github.com/shadcn-ui/ui) |
| `@ni2khanna/uikit-lucide` | [Lucide](https://lucide.dev/) icon set as SVG components |
| `@ni2khanna/msdfonts` | MSDF font data distributed as an npm package |
| `@ni2khanna/uikit-pub-sub` | Reactive pub-sub primitives used internally |

## Quick start

```ts
import { PerspectiveCamera, Scene, WebGLRenderer } from 'three'
import { reversePainterSortStable, Container, Text, Fullscreen } from '@ni2khanna/uikit'
import { forwardHtmlEvents } from '@pmndrs/pointer-events'
import { defaultProperties } from '@ni2khanna/uikit-default'

const canvas = document.getElementById('root') as HTMLCanvasElement
const renderer = new WebGLRenderer({ antialias: true, canvas })
renderer.localClippingEnabled = true
renderer.setTransparentSort(reversePainterSortStable)

const camera = new PerspectiveCamera(70, 1, 0.01, 100)
camera.position.z = 5
const scene = new Scene()
scene.add(camera)

const { update } = forwardHtmlEvents(canvas, camera, scene)

const root = new Fullscreen(renderer, {
  ...defaultProperties,
  flexDirection: 'row',
  padding: 10,
  gap: 10,
})
camera.add(root)

root.add(new Container({ flexGrow: 1, opacity: 0.5, hover: { opacity: 1 }, backgroundColor: 'red' }))
root.add(new Container({ flexGrow: 1, opacity: 0.5, hover: { opacity: 1 }, backgroundColor: 'blue' }))

function updateSize() {
  renderer.setSize(window.innerWidth, window.innerHeight)
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
}
updateSize()
window.addEventListener('resize', updateSize)

let prev: number | undefined
renderer.setAnimationLoop((time: number) => {
  const delta = prev == null ? 0 : time - prev
  prev = time
  update()
  root.update(delta)
  renderer.render(scene, camera)
})
```

## Examples

All examples are vanilla TypeScript and live in the `examples/` directory:

| Example | Description |
|---|---|
| `vanilla` | Basic UI with containers, text, images, scroll |
| `minimal` | Interactive elements: hover, click counter, toggle, input, scroll list |
| `card-vanilla` | Notification card with toggle and switch |
| `auth-vanilla` | Login form with inputs, buttons, OAuth layout |
| `lucide-vanilla` | Scrollable grid of all Lucide icons |
| `market-vanilla` | Full app layout: sidebar, tabs, menubar, album cards |
| `dashboard-vanilla` | Dashboard with stats cards, bar chart, recent sales |
| `default-vanilla` | Component showcase: accordion, alert, dialog, tabs, slider, and more |
| `ttf-vanilla` | Runtime TTF/OTF font loading |
| `svg-unicode-vanilla` | SVG fill/style/currentColor coverage plus unicode font fallbacks |

Run any example:

```bash
pnpm install
cd examples/<name>
pnpm dev
```

Append `?renderer=webgpu` to the URL to use the WebGPU renderer.

## Acknowledgements

This project is a fork of [**@pmndrs/uikit**](https://github.com/pmndrs/uikit), created and maintained by [Poimandres](https://github.com/pmndrs) ([@pmndrs](https://github.com/pmndrs)).

Original author: [Bela Bohlender](https://github.com/bbohlender) ([@bbohlender](https://github.com/bbohlender)).

The upstream project provides the foundational architecture — yoga-based flexbox layout, MSDF text rendering, instanced panel rendering, theming, and the full default component kit. This fork builds on that work by providing a vanilla-first TypeScript API with optional React Three Fiber support and adding WebGPU compatibility.

Thank you to the entire pmndrs community and the original contributors for building and open-sourcing this library.

## License

See [LICENSE](./LICENSE).
