import { useMemo, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { RenderTexture, Gltf, Box } from '@react-three/drei'
import { signal } from '@preact/signals-core'
import {
  DefaultProperties,
  Container,
  Content,
  CustomContainer,
  Svg,
  Text,
  Image,
  Fullscreen,
} from '@react-three/uikit'
import { Texture } from 'three'

export default function App() {
  const texture = useMemo(() => signal<Texture | undefined>(undefined), [])
  const [show, setShow] = useState(false)
  const s = useMemo(() => signal(5), [])
  const x = useMemo(() => signal<string | undefined>('red'), [])
  const t = useMemo(() => signal('X X\nX X'), [])
  return (
    <Canvas style={{ height: '100dvh', touchAction: 'none' }} gl={{ localClippingEnabled: true }}>
      <color attach="background" args={['black']} />
      <ambientLight intensity={0.5} />
      <directionalLight intensity={10} position={[5, 1, 10]} />
      <Gltf position={[200, 0, 200]} scale={0.1} src="scene.glb" />
      <RenderTexture ref={(t) => (texture.value = t ?? undefined)}>
        <Box />
      </RenderTexture>
      <Fullscreen
        gap={10}
        overflow="scroll"
        padding={10}
        alignItems="center"
        flexDirection="column"
        border={10}
        borderRight={0}
        borderColor="red"
      >
        <Container backgroundColor="blue" width={100} positionType="relative">
          <Container>
            <Text>Escribe algo...</Text>
          </Container>
          <Container backgroundColor="red" positionType="absolute" positionTop="100%" positionRight="100%">
            <Text>Escribe algo...</Text>
          </Container>
        </Container>
        <DefaultProperties opacity={0.5} border={s}>
          <Image width={300} height={300} src={texture ?? undefined} />
          <Text
            onClick={() => {
              t.value += 'X'
              setShow((s) => !s)
            }}
            width="100%"
            backgroundOpacity={0.5}
            backgroundColor="black"
            fontSize={30}
            verticalAlign="bottom"
            horizontalAlign="block"
            cursor="pointer"
          >
            {t}
            more
          </Text>
          <Container
            onHoverChange={(hover) => (x.value = hover ? 'yellow' : undefined)}
            backgroundColor={x}
            borderColor="white"
            borderBend={1}
            border={20}
            borderRadius={30}
            width={300}
            height={100}
          />
          <CustomContainer transformRotateZ={45} height={200} width={4}>
            <meshPhongMaterial depthWrite={false} transparent color="green" />
          </CustomContainer>
          <Content
            height={200}
            width={200}
            hover={{ height: 300 }}
            transformScaleZ={0.05}
            depthAlign="back"
            onSizeChange={(w, h) => console.log(w, h)}
            keepAspectRatio={false}
            borderRight={100}
          >
            <mesh>
              <planeGeometry />
              <meshPhongMaterial depthWrite={false} transparent />
            </mesh>
          </Content>
          <Content width={100}>
            <Gltf src="example.glb" />
          </Content>
          <Svg marginLeft={-100} color={x} backgroundColor="red" src="example.svg" width={200} />
          <Image
            hover={{ padding: 30, border: 0, marginLeft: -30, opacity: 1 }}
            fit="cover"
            border={20}
            borderOpacity={0.2}
            borderRadius={10}
            src="https://picsum.photos/200/300"
            width={300}
          />
        </DefaultProperties>

        <Container
          positionType="relative"
          width="60%"
          height="60%"
          alignItems="center"
          justifyContent="center"
          backgroundColor="green"
          zIndexOffset={1}
        >
          <Container
            width={100}
            height={100}
            positionType="absolute"
            positionBottom="100%"
            positionRight="100%"
            marginRight={10}
            backgroundColor="red"
          ></Container>
          <Text>Hello world</Text>
        </Container>

        {show ? (
          <Container overflow="scroll" maxHeight={500} height={500} paddingRight={10}>
            <Container
              onClick={() => (s.value += 10)}
              backgroundColor="yellow"
              width={300}
              minHeight={300}
              height={300}
            />
            <Container backgroundColor="black" width={300} minHeight={300} height={300} />
          </Container>
        ) : undefined}
      </Fullscreen>
    </Canvas>
  )
}
