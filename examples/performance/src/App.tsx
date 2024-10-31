import { Canvas, useThree } from '@react-three/fiber'
import { DefaultProperties, Container, Text, Root } from '@react-three/uikit'
import { OrbitControls } from '@react-three/drei'
import { Perf } from 'r3f-perf'
import { forwardHtmlEvents } from '@pmndrs/pointer-events'
import { useEffect } from 'react'

//events={() => ({ enabled: false, priority: 0 })}

export default function App() {
  return (
    <Canvas
      events={() => ({ enabled: false, priority: 0 })}
      style={{ height: '100dvh', touchAction: 'none' }}
      gl={{ localClippingEnabled: true }}
    >
      <color attach="background" args={['black']} />
      <SwitchToXRPointerEvents />
      <OrbitControls />
      <Perf />
      <Root width={1920 * 2} positionType="relative">
        <DefaultProperties fontSize={4}>
          <Container positionType="absolute" gap={1} flexWrap="wrap" inset={0}>
            {new Array(20000).fill(null).map((_, i) => (
              <Container
                key={i}
                padding={2}
                borderRadius={Math.random() * 5}
                backgroundColor={Math.random() * 0xffffff}
                borderWidth={Math.random() * 1}
                borderColor={Math.random() * 0xffffff}
                onClick={() => console.log('what up?')}
              >
                <Text>Hello World</Text>
              </Container>
            ))}
          </Container>
        </DefaultProperties>
      </Root>
    </Canvas>
  )
}

function SwitchToXRPointerEvents() {
  const domElement = useThree((s) => s.gl.domElement)
  const camera = useThree((s) => s.camera)
  const scene = useThree((s) => s.scene)
  useEffect(() => forwardHtmlEvents(domElement, camera, scene), [domElement, camera, scene])
  return null
}
