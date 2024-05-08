import { Canvas } from '@react-three/fiber'
import { DefaultProperties, Container, Text, Root } from '@react-three/uikit'
import { OrbitControls } from '@react-three/drei'
import { Perf } from 'r3f-perf'

export default function App() {
  return (
    <Canvas style={{ height: '100dvh', touchAction: 'none' }} gl={{ localClippingEnabled: true }}>
      <color attach="background" args={['black']} />
      <OrbitControls />
      <Perf />
      <Root width={1920 * 4} positionType="relative">
        <DefaultProperties fontSize={4}>
          <Container positionType="absolute" gap={1} flexWrap="wrap" inset={0}>
            {new Array(10000).fill(null).map((_, i) => (
              <Text
                key={i}
                padding={2}
                borderRadius={Math.random() * 5}
                backgroundColor={Math.random() * 0xffffff}
                borderWidth={Math.random() * 1}
                borderColor={Math.random() * 0xffffff}
              >
                Hello World
              </Text>
            ))}
          </Container>
        </DefaultProperties>
      </Root>
    </Canvas>
  )
}
