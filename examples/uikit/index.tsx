import { MutableRefObject, StrictMode, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { createRoot } from 'react-dom/client'
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
import { signal } from '@preact/signals-core'
import { Gltf, Box } from '@react-three/drei'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

function App() {
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
        <DefaultProperties opacity={0.5} border={s}>
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
          </Text>
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
          <Container
            onHoverChange={(hover) => (x.value = hover ? 'yellow' : undefined)}
            backgroundColor={x}
            borderBend={1}
            border={20}
            borderRadius={30}
            width={300}
            height={100}
          />
          <CustomContainer transformRotateZ={45} height={200} width={4}>
            <meshPhongMaterial depthWrite={false} transparent color="green" />
          </CustomContainer>
          <Content height={200} hover={{ height: 300 }} depthAlign="front" onSizeChange={(w, h) => console.log(w, h)}>
            <Box>
              <meshPhongMaterial depthWrite={false} transparent />
            </Box>
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
          positionType="absolute"
          inset="20%"
          width="60%"
          height="60%"
          alignItems="center"
          justifyContent="center"
          backgroundColor="green"
          zIndexOffset={1}
        >
          <Text>Hello world</Text>
        </Container>
      </Fullscreen>
    </Canvas>
  )
}