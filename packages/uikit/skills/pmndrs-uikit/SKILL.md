---
name: pmndrs-uikit
description: Build 3D user interfaces in vanilla three.js with @pmndrs/uikit (flexbox layout, text, images, inputs, scrolling, and styling of UI panels placed in a scene, on screen, or in VR/AR). Use when writing or debugging code that constructs uikit components such as `new Container(...)`, or code that uses the vanilla kits (@pmndrs/uikit-default, @pmndrs/uikit-horizon, @pmndrs/uikit-lucide). This skill also defines the property and styling model that @react-three/uikit shares; for React Three Fiber setup, use the react-three-uikit skill.
---

# @pmndrs/uikit

Every uikit component is a three.js `Object3D`. Yoga lays the components out with flexbox, and they render as instanced panels and MSDF text, so a whole interface costs only a few draw calls. Properties mirror CSS in camelCase, and lengths are in pixels.

## Scene setup

```ts
import { Container, Text, reversePainterSortStable } from '@pmndrs/uikit'
import { forwardHtmlEvents } from '@pmndrs/pointer-events'

renderer.localClippingEnabled = true
renderer.setTransparentSort(reversePainterSortStable)

const root = new Container({ sizeX: 2, sizeY: 1, padding: 16, flexDirection: 'column', backgroundColor: '#222' })
root.position.set(0, 1.5, -1)
scene.add(root)
root.add(new Text({ text: 'Hello', color: 'white' }))

const events = forwardHtmlEvents(canvas, camera, scene)
let prev: number | undefined
renderer.setAnimationLoop((time) => {
  const delta = prev == null ? 0 : time - prev
  prev = time
  events.update()
  root.update(delta)
  renderer.render(scene, camera)
})
```

- Each line of this setup is required. Without local clipping, scrolled and `overflow: 'hidden'` content draws outside its parent. Without `reversePainterSortStable`, panels and text sort incorrectly and flicker.
- `update(delta)` takes milliseconds and does nothing unless it is called on a root, meaning a uikit component whose parent is not a uikit component. Layout, scrolling, and loading run inside it, so each root needs its own call every frame.
- three.js has no pointer event system. Without one, `hover`, `active`, clicks, scrolling, and inputs stay inert. `@pmndrs/pointer-events` provides the event system, and it also covers XR controllers and hands ([docs](https://github.com/pmndrs/xr/tree/main/packages/pointer-events#readme)). To use another event system, type its events by augmenting three's `Object3DEventMap`. `@pmndrs/pointer-events` does this automatically when it is imported before uikit.

## Choosing the root: units and size

Inside the UI, lengths are pixels. `pixelSize` converts pixels to world units: it defaults to `0.01`, so 100px equals 1 unit, and descendants inherit it. Keep web-sized values such as 16px text, and change `pixelSize` to scale a whole UI. Inflating `fontSize` and `width` does not scale the UI as a whole, and kit components assume web sizes.

- **Panel in the world**: use a `Container` root. `sizeX` and `sizeY` set its size in world units. Without them, the root sizes to its content. `anchorX` and `anchorY` choose which point of the root sits at its origin (the default is the center). Move, rotate, and scale the root like any `Object3D`.
- **Screen overlay or HUD**: use `new Fullscreen(renderer, props)`. Add it to the camera and add the camera to the scene. On each update, it fits itself to the view and sets `pixelSize` so that 1px matches 1 screen pixel. `distanceToCamera` sets how far in front of the camera it sits.
- The breakpoint conditionals `sm` through `2xl` compare against the root's width in **pixels**, not the browser window's width. At the default `pixelSize`, a world panel with `sizeX: 2` is 200px wide and never reaches `sm`.

## Components

| Need | Use | Watch out |
| --- | --- | --- |
| Box, row, column, background, border | `Container` | Its children must be uikit components. Adding a `Mesh` throws, so put three.js objects in `Content`. |
| Text | `Text` with the `text` property | `text` takes a string, a number, a signal, or an array of these. `Text` cannot have children. To style parts of a sentence differently, use several `Text` elements in a row with `flexWrap: 'wrap'`. |
| Picture, video, icon | `Image`, `Video`, `Svg` | These have no children. To overlay something on an image, wrap the image in a `positionType: 'relative'` container and give the overlay `positionType: 'absolute'` and a higher `zIndex`. |
| Text entry | `Input`, `Textarea` | Use `value` with `onValueChange` for a controlled input, or `defaultValue` for an uncontrolled one. Both rely on a hidden DOM input, so they need a browser. |
| 3D model or arbitrary object in the layout | `Content` | Its children are scaled to fit its box. It remeasures when direct children are added or removed. After any deeper change, such as a model loaded into a nested group, call `notifyAncestorsChanged()`. |
| Panel with your own shader | `Custom` | It is never batched, so each one costs a draw call. |

Kits build on these components. `@pmndrs/uikit-default` is shadcn-style, `@pmndrs/uikit-horizon` is Meta Horizon OS-style, and `@pmndrs/uikit-lucide` provides icons. Kit components are ordinary uikit components that take the same properties and compose with `add()`. Each kit exports its theme `colors` as signals, so custom elements can match it.

## Property model

**Values.** A plain number is a pixel length. Strings can be `'50%'`, `'12px'`, or `'50vw'`/`'50vh'`. A unitless `lineHeight` is a multiplier, while `'20px'` is absolute. Colors can be CSS strings, hex numbers, a `Color`, or RGB(A) tuples. Opacity belongs in the color itself (rgba or `withOpacity(color, 0.5)`); there is no `backgroundOpacity`. Use `'initial'` to reset a property to its default. Shorthands such as `padding`, `paddingX`, `margin`, `gap`, `inset`, `borderWidth`, `borderRadius`, and `transformScale` expand to their sides.

**Flexbox** uses the web defaults: `flexDirection: 'row'` and `flexShrink: 1`. Yoga has no `min-height: auto`, though, so children of a size-constrained parent shrink below their content instead of overflowing. Set `flexShrink: 0` on items in lists and scroll containers.

**Scrolling.** `overflow: 'scroll'` or `'hidden'` clips content. A scroll container scrolls only when its own size is constrained, by `height`/`maxHeight`, or by `flexGrow` inside a sized parent. Scrollbars are styled with the `scrollbar*` properties. An `onScroll` handler can return `false` to reject a scroll step.

**Inheritance.** Text properties (`color`, `fontSize`, `fontFamily`, `fontWeight`, `lineHeight`, …), plus `opacity`, `pixelSize`, `visibility`, and `pointerEvents`, inherit as they do in CSS. Set them once, high in the tree.

**Conditionals** are nested property objects: `hover`, `active`, `focus`, `placeholderStyle`, `dark`, `sm`/`md`/`lg`/`xl`/`2xl`, and `important`. When properties conflict, precedence runs from strongest to weakest:

1. `important`
2. `placeholderStyle`, then `focus`, `active`, `hover`, `dark`, and `2xl`…`sm`, in that order
3. Plain properties

Within each of these levels, the order is: the element's own properties, then later classes, then earlier classes, then the component's built-in styling (for example, a kit's). Below all of that come `'*'` properties from ancestors, then inherited values, then global properties.

**Defaults for a subtree.** `{ '*': { ... } }` sets defaults for all descendants (not the element itself), and the descendants' own properties still win. To scope such defaults without adding a layout box, put them on a `display: 'contents'` container. `setGlobalProperties` sets defaults for every component at the lowest precedence.

**Classes.** `StyleSheet.name = { ... }` registers a global class, and `component.classList.add('name')` applies it. `classList` also accepts inline property objects. Unknown class names log a warning and are ignored. A class registered as `StyleSheet['__id__foo']` applies automatically to the element whose `id` is `'foo'`.

**Dark mode.** `setPreferredColorScheme('light' | 'dark' | 'system')` drives the `dark` conditional. `basedOnPreferredColorScheme({ light, dark })` returns color signals for themes.

## Changing and reading state

- `setProperties(partial)` merges into the properties the component was given, and `resetProperties(all)` replaces them. Changes take effect on the next `update`.
- Any property value can be a `@preact/signals-core` signal. Setting `signal.value` updates just that property, which is the cheapest way to animate a property every frame.
- Computed state is exposed as signals: `size` (in pixels, available after the first `update`), `properties.value.<name>` (the resolved values), `scrollPosition`, and `isClipped`. Use `effect` from `@preact/signals-core` to react to them. There is no size-change event to subscribe to.
- `onHoverChange` and `onActiveChange` report interaction state, and `on*` pointer handlers are passed as properties.
- `dispose()` removes the component and stops its effects. It does not recurse, so dispose descendants that are no longer used yourself. `clone()` works, but `copy()` throws.

## Fonts

- The default font is Inter. Bundled MSDF families are available as imports such as `import { roboto } from '@pmndrs/msdfonts/roboto'`. Register them with `fontFamilies: { roboto }` and select one with `fontFamily: 'roboto'`. `fontFamilies` is inherited, so set it on the root.
- To load a TTF at runtime, use `await new TTFLoader().loadAsync(url | urls)`, which returns a `fontFamilies` value. It costs a WASM download plus generation time, and the default charset covers only basic Latin, so pass `charset` for other glyphs. For production builds, pre-generate MSDF fonts instead ([custom fonts](https://pmndrs.github.io/uikit/docs/tutorials/custom-fonts)).

## Rendering and performance

- Panels are batched per material class, and glyphs are batched per font. Each distinct `panelMaterialClass` (a material class or one of the presets `'glass'`, `'metal'`, `'plastic'`) and each font family adds draw calls. Lit materials need lights in the scene.
- `zIndex` orders elements as it does in CSS. Objects inside `Content` must be either transparent, or depth-writing with a small z offset toward the viewer. Otherwise, the transparent sort draws them in the wrong order.

## Coming from uikit 0.x

Code from 0.x needs these changes: `setStyle` becomes `setProperties`; `border*` becomes `border*Width`; `backgroundOpacity` and `borderOpacity` are removed (put alpha in the color instead); `textAlign: 'block'` becomes `'justify'`; `scrollbarBackgroundColor` becomes `scrollbarColor`; and `Image` no longer accepts children ([migration guide](https://pmndrs.github.io/uikit/docs/migration/from-version-0)).
