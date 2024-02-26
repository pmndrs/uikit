import Image from '@theme/IdealImage';
import { CodesandboxEmbed } from '../CodesandboxEmbed.tsx'

# Overflow, Scroll, and Clipping

**Koestlich** handles clipping and scrolling for you. You only need to specify `overflow` "scroll" or "hidden" on any container. First, however, we need to configure react-three/fiber to support visual clipping and clipping of events, which is done via `<Canvas events={clippingEvents} gl={{ localClippingEnabled: true }}>`.

:::caution Important
All components are animated by default using the `distanceFadeAnimation`. For a snappy scroll experience, the animation can be disabled by providing the `noAnimation` animation on the direct children of the scroll container.

The following example shows a scrollable user interface using the `noAnimation` property to deliver a snappy scroll experience.
:::

<CodesandboxEmbed path="koestlich-overflow-c9nkvc"/>

<Image img={require('@site/static/images/scroll.gif')}/>

```tsx
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { RootContainer, Container, clippingEvents, noAnimation } from "@coconut-xr/koestlich";

export default function App() {
  return (
    <Canvas events={clippingEvents} gl={{ localClippingEnabled: true }}>
      <OrbitControls enableRotate={false} />
      <RootContainer
        backgroundColor="red"
        sizeX={2}
        sizeY={1}
        flexDirection="row"
        overflow="scroll"
      >
        <Container animation={noAnimation}>
          <Container width={750} margin={48} backgroundColor="green" />
          <Container width={750} margin={48} backgroundColor="blue" />
        </Container>
      </RootContainer>
    </Canvas>
  );
}
```
