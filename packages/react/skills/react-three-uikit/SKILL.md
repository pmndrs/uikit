---
name: react-three-uikit
description: Build 3D user interfaces in React Three Fiber with @react-three/uikit (`<Fullscreen>`, `<Container>`, `<Text>`, and the React kits @react-three/uikit-default, @react-three/uikit-horizon, and @react-three/uikit-lucide). Use when writing or debugging R3F code that renders uikit components, such as a HUD, an in-world panel, or VR/AR UI. For vanilla three.js, use the pmndrs-uikit skill.
---

# @react-three/uikit

Each JSX element creates the matching @pmndrs/uikit component. Its props become the component's properties, and its `ref` is the vanilla component instance. Both packages share one property model. The `pmndrs-uikit` skill describes it: pixel units and `pixelSize`, conditionals and precedence, `'*'` defaults, classes, fonts, and the `flexShrink` and scrolling pitfalls. That skill ships with the `@pmndrs/uikit` dependency at `node_modules/@pmndrs/uikit/skills/pmndrs-uikit/SKILL.md`. Read it before doing any styling that goes beyond a few props.

## Setup

```tsx
import { Canvas } from '@react-three/fiber'
import { Fullscreen, Container, Text } from '@react-three/uikit'

<Canvas style={{ touchAction: 'none' }}>
  <Fullscreen flexDirection="column" padding={16} gap={8}>
    <Text fontSize={24}>Hello</Text>
    <Container width={120} height={40} backgroundColor="red" hover={{ backgroundColor: 'blue' }} onClick={save} />
  </Fullscreen>
</Canvas>
```

- The components configure the renderer for clipping and transparent sorting, and they update their roots in R3F's frame loop. Neither needs manual setup, and `frameloop="demand"` works.
- `<Fullscreen>` is a screen overlay. If the camera has no parent, it adds the camera to the scene so the overlay renders; `attachCamera={false}` opts out.
- For a panel in the world, use `<Container sizeX={2} sizeY={1}>`. Props are uikit properties and are not forwarded to the three.js object, so `position`, `rotation`, and `scale` do nothing on uikit components. Place the panel with a wrapping `<group>` instead.
- All R3F pointer handlers (`onClick`, `onPointerOver`, …) work on every component, and R3F's default event system handles mouse and touch. The pmndrs examples replace that event system with `<Canvas events={noEvents}>` plus `<PointerEvents />` from `@react-three/xr`, which also handles XR controllers and hands.
- When the UI uses `Input` or `Textarea`, spread `{...canvasInputProps}` on `<Canvas>`. Otherwise, clicking the canvas lets the browser take focus away from the input.

## Writing components

- **`Text` children** must be strings, numbers, signals, or a mix of them, such as `<Text>{count} items</Text>`. Elements inside `Text` are not supported. To style parts of a sentence differently, use sibling `Text`s in a wrapping row.
- **Every React render reapplies the props.** As a result, a change made with `ref.current.setProperties(...)` lasts only until that component renders again. To animate a property, pass a `@preact/signals-core` signal as the prop and write to it in `useFrame`. This involves no React render and no prop diffing:

  ```tsx
  const opacity = useMemo(() => signal(1), [])
  useFrame(({ clock }) => void (opacity.value = Math.sin(clock.elapsedTime) / 2 + 0.5))
  return <Container opacity={opacity} />
  ```

- **`'*'` is not a valid JSX attribute name**, so spread it: `<Container {...{ '*': { color: 'white' } }}>`. For subtree defaults without a layout box, add `display="contents"`.
- **The core API is only partly re-exported.** `classList={['card', { padding: 8 }]}` works on every component, but `StyleSheet` and `setGlobalProperties` must be imported from `@pmndrs/uikit`. Add that package as a direct dependency, because strict package managers do not resolve transitive imports.
- **Computed state** lives on the ref as signals: `ref.current.size.value` (in pixels) and `ref.current.properties.value`. Read it in an `effect` or in `useFrame`, not during render.
- **Loading:**
  - `<Image>` loads its texture silently. `<SuspendingImage>` and `<SuspendingVideo>` suspend until the media is ready (`SuspendingImage` does not dispose its texture).
  - `useTTF(url)` loads a runtime font as `fontFamilies` and also suspends.
  - Wrap each of these in `<Suspense>`. With `<Content>`, put the `<Suspense>` outside the `<Content>`, so that `<Content>` measures the loaded model instead of an empty placeholder.
- **`<Portal>`** renders its own R3F children into a texture that is shown in the layout. `dpr` sets the texture's resolution.

## Kits

Install `@react-three/uikit-default` (shadcn-style) or `@react-three/uikit-horizon` (Meta Horizon OS-style) for prebuilt components, and `@react-three/uikit-lucide` for icon components. Kit components accept the same props as `Container`. `@react-three/uikit-default` also exports `colors` (theme color signals) for matching custom elements, and `setTheme` / `defaultThemes` for switching themes.

## Coming from uikit 0.x

These 0.x components are deprecated:

| Deprecated | Replacement |
| --- | --- |
| `Root` | A `Container`, or nothing |
| `DefaultProperties` | `'*'` on a `display="contents"` `Container` |
| `FontFamilyProvider` | The `fontFamilies` prop on any component |
| `Icon` | `Svg`, with its `text` prop renamed to `content` |

The core skill lists the property renames.
