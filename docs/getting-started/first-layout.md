import Image from '@theme/IdealImage';
import { CodesandboxEmbed } from '../CodesandboxEmbed.tsx'

# First Layout

At first, we will create 3 containers. One container is the root node with a size of 2 by 1 three.js untits, expressed by `Root`. The `Root` has a horizontal (row) flex-direction, while the children expressed by `Container` equally fill its width with a margin between them.

<CodesandboxEmbed path="koestlich-first-layout-owgw9d"/>

<Image img={require('@site/static/images/first-layout.png')}/>

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
