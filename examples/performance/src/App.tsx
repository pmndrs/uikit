import { Canvas } from '@react-three/fiber'
import { DefaultProperties, Container, Text, Root } from '@react-three/uikit'
import { OrbitControls } from '@react-three/drei'
import { Perf } from 'r3f-perf'
import { noEvents, PointerEvents } from '@react-three/xr'

export default function App() {
  return (
    <Canvas events={noEvents} style={{ height: '100dvh', touchAction: 'none' }} gl={{ localClippingEnabled: true }}>
      <color attach="background" args={['black']} />
      <PointerEvents />
      <OrbitControls />
      <Perf />
      <Root width={1920 * 2} positionType="relative">
        <DefaultProperties fontSize={4}>
          <Container positionType="absolute" gap={1} flexWrap="wrap" inset={0}>
            {new Array(20000).fill(null).map((_, i) => {
              const borderWidth = Math.random() * 1
              return (
                <Container
                  key={i}
                  borderRadius={Math.random() * 5}
                  backgroundColor={Math.random() * 0xffffff}
                  borderWidth={borderWidth}
                  borderColor={Math.random() * 0xffffff}
                  height={4 + 4 + 2 * borderWidth}
                  padding={2}
                  pointerEvents="none"
                  hover={{ backgroundColor: 'white', borderColor: 'black' }}
                >
                  <Text pointerEvents="auto" hover={{ color: 'red' }}>
                    Hello World
                  </Text>
                </Container>
              )
            })}
          </Container>
        </DefaultProperties>
      </Root>
    </Canvas>
  )
}
