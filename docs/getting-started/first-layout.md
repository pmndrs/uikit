---
title: First Layout
description: Build your first layout with uikit.
nav: 1
---

Let's start creating the first layout using 2 `Container` and 1 `Root`. Every layout needs to start with a `Root` elment (or a element that wraps the `Root` element such as the `Fullscreen` component). In this example, the `Root` is of size of 2 by 1 (three.js units). The `Root` has a horizontal (row) flex-direction, while its children, the `Container`s, equally fill its width with a margin arround them.

More in the depth information to the flexbox properties can be found [here](https://yogalayout.dev/docs/).

```tsx
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Root, Container } from "@react-three/uikit";

export default function App() {
  return (
    <Canvas>
      <OrbitControls />
      <Root backgroundColor="red" sizeX={2} sizeY={1} flexDirection="row">
        <Container flexGrow={1} margin={48} backgroundColor="green" />
        <Container flexGrow={1} margin={48} backgroundColor="blue" />
      </Root>
    </Canvas>
  );
}
```
