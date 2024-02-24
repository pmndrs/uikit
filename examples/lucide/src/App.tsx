import { Canvas } from '@react-three/fiber'
import { Fullscreen } from '@react-three/uikit'
import * as Icons from '@react-three/uikit-lucide'

export default function App() {
  return (
    <Canvas style={{ height: '100dvh', touchAction: 'none' }} gl={{ localClippingEnabled: true }}>
      <color attach="background" args={['black']} />
      <ambientLight intensity={0.5} />
      <directionalLight intensity={0} position={[5, 1, 10]} />
      <Fullscreen
        scrollbarColor="black"
        backgroundColor="white"
        flexDirection="row"
        flexWrap="wrap"
        overflow="scroll"
        gap={10}
        padding={10}
      >
        {Object.values(Icons).map((Icon, i) => (
          <Icon key={i} />
        ))}
      </Fullscreen>
    </Canvas>
  )
}
