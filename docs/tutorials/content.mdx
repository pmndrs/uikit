import Image from '@theme/IdealImage';
import { CodesandboxEmbed } from '../CodesandboxEmbed.tsx'

# 3D Content

The previous examples showed 2D elements positioned in the x/y plane. Integrating 3D geometries into the UI will make use of the z-Axis. In addition to having width and height, all components now have depth, which is their size on the z-Axis. All UI elements will be placed in front of their parent along the z-Axis.

<Image img={'https://mayaposch.files.wordpress.com/2012/12/opengl_coordinate_system.png'} alt="Three.js Coordinate System"/>

[<small>Image Source</small>](https://mayaposch.wordpress.com/2012/12/17/on-the-coordinate-system-of-qgraphicsscene-in-qt/opengl_coordinate_system/)

**Koestlich** supports any Three.js geometry and material. The following example shows how to use the `GLTF` component to import a 3D model directly and how to use the `Object` component to insert an object with a `SphereGeomerty` and a `MeshPhongMaterial` into the layout.

<CodesandboxEmbed path="koestlich-3d-content-153ljq"/>

<Image img={require('@site/static/images/3d-content.png')}/>

```tsx
import { RootContainer, Object, GLTF, Container } from "@coconut-xr/koestlich";
import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useMemo } from "react";
import { Mesh, MeshPhongMaterial, SphereBufferGeometry } from "three";

export default function App() {
  const sphere = useMemo(
    () =>
      new Mesh(
        new SphereBufferGeometry(),
        new MeshPhongMaterial({ toneMapped: false, color: "blue" }),
      ),
    [],
  );

  return (
    <Canvas>
      <directionalLight position={[1, 1, 1]} intensity={2} />
      <ambientLight intensity={0.1} />
      <OrbitControls />
      <RootContainer
        backgroundColor="red"
        sizeX={3}
        sizeY={1}
        borderRadius={48}
        flexDirection="row"
        overflow="hidden"
        justifyContent="space-evenly"
        padding={32}
      >
        <Object aspectRatio={1} index={0} object={sphere} padding={96}>
          <Container flexGrow={1} backgroundColor="green" />
        </Object>
        <Suspense>
          <GLTF index={1} url="Avocado.glb" />
        </Suspense>
      </RootContainer>
    </Canvas>
  );
}
```

Our example dashboard interface can be built using `ExtrudeGeometry` from three.js and the SVGs from any icon library. However, we use the `SVGLoader` code from the three.js/examples, which has limited features.

<CodesandboxEmbed path="koestlich-rounded-box-svg-1r3myd"/>

<Image img={require('@site/static/images/roundedbox-svg.png')}/>

```tsx
import { RootContainer, Object, SVG } from "@coconut-xr/koestlich";
import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { ExtrudeGeometry, Shape, Mesh, MeshPhongMaterial } from "three";
import { Suspense, useMemo } from "react";

export default function App() {
  const mesh1 = useMemo(() => new Mesh(new CardGeometry(1, 1, 0.1),new MeshPhongMaterial({
      toneMapped: false,
      transparent: true
    })), []);
  const mesh2 = useMemo(() => new Mesh(new CardGeometry(1, 1, 0.1),new MeshPhongMaterial({
      toneMapped: false,
      transparent: true
    })), []);
  const mesh3 = useMemo(() => new Mesh(new CardGeometry(1, 1, 0.1),new MeshPhongMaterial({
      toneMapped: false,
      transparent: true
    })), []);
  return (
    <Canvas>
      <OrbitControls />
      <ambientLight intensity={0.5} />
      <directionalLight intensity={0.8} position={[1, 1, 1]} />
      <RootContainer
        backgroundColor="black"
        sizeX={2}
        sizeY={1}
        flexDirection="row"
      >
        <Object
          depth={48}
          object={mesh1}
          {...}
        >
          <Suspense>
            <SVG url="bank.svg" flexShrink={1} />
          </Suspense>
        </Object>
        <Object
          depth={48}
          object={mesh2}
          {...}
        >
          <Suspense>
            <SVG url="message.svg" flexShrink={1} />
          </Suspense>
        </Object>
        <Object
          depth={48}
          object={mesh3}
          {...}
        >
          <Suspense>
            <SVG url="clock.svg" flexShrink={1} />
          </Suspense>
        </Object>
      </RootContainer>
    </Canvas>
  );
}

class CardGeometry extends ExtrudeGeometry {
  constructor(width: number, height: number, radius: number) {
    const roundedRectShape = new Shape();
    roundedRectShape.moveTo(0, radius);
    roundedRectShape.lineTo(0, height - radius);
    roundedRectShape.quadraticCurveTo(0, height, radius, height);
    roundedRectShape.lineTo(width - radius, height);
    roundedRectShape.quadraticCurveTo(width, height, width, height - radius);
    roundedRectShape.lineTo(width, radius);
    roundedRectShape.quadraticCurveTo(width, 0, width - radius, 0);
    roundedRectShape.lineTo(radius, 0);
    roundedRectShape.quadraticCurveTo(0, 0, 0, radius);
    super(roundedRectShape, { depth: 1, bevelEnabled: false });
  }
}
```
