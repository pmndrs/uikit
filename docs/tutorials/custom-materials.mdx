import Image from '@theme/IdealImage';
import { CodesandboxEmbed } from '../CodesandboxEmbed.tsx'

# Custom Materials

**Koestlich** allows to provide custom materials for the background on the `Text`, `Container`, and `Image` components. Using the library `@coconut-xr/xmaterials`, a new material can be built based on the existing three materials. Every provided material must be at least be a border material created through `makeBorderMaterial`. The `makeBorderMaterial` allows to provide default properties to the material. In the following example, we are creating a text element with a material based on the phong material with high specular and shininess. Using the border properties, we can create a border that creates the illusion of a 3d mesh. Specifically, the `borderBend` property allows bending the normals on the border to create this effect efficiently. The `anchorX` and `anchorY` properties allow the button in the following example to have its origin in (0,0,0).

<CodesandboxEmbed path="koestlich-custom-materials-vchy5l"/>

<Image img={require('@site/static/images/custom-materials.jpg')}/>

```tsx
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { clippingEvents, RootText } from "@coconut-xr/koestlich";
import { makeBorderMaterial } from "@coconut-xr/xmaterials";
import { MeshPhongMaterial } from "three";

const FancyMaterial = makeBorderMaterial(MeshPhongMaterial, {
  specular: 0x111111,
  shininess: 100,
});

export default function App() {
  return (
    <Canvas events={clippingEvents} gl={{ localClippingEnabled: true }}>
      <OrbitControls enableRotate={false} />
      <RootText
        backgroundColor="black"
        color="white"
        anchorX="center"
        anchorY="center"
        padding={24}
        borderRadius={32}
        fontSize={32}
        borderColor="black"
        borderBend={0.3}
        border={8}
        material={FancyMaterial}
      >
        I look fancy
      </RootText>
    </Canvas>
  );
}
```
