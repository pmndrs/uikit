import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Text, Fullscreen, Container } from '@react-three/uikit'
import { TTFLoader, useTTF } from '@react-three/uikit'
import workerUrl from '@pmndrs/uikit/msdf-worker.js?url'
import wasmUrl from '@pmndrs/uikit/msdfgen_wasm.wasm?url'
import fontUrl from '../BitcountPropSingle-Regular.ttf?url'
import { noEvents, PointerEvents } from '@react-three/xr/dist/events.js'

TTFLoader.config = { workerUrl, wasmUrl }

function UI() {
  const fontFamilies = useTTF(fontUrl)

  return (
    <Fullscreen flexDirection="column" alignItems="center" justifyContent="center" gap={24} fontFamilies={fontFamilies}>
      <Text fontSize={48} color="white">
        TTF Loader Example
      </Text>
      <Text fontSize={24} color="gray">
        Loading fonts at runtime with @react-three/uikit-ttf
      </Text>
    </Fullscreen>
  )
}

function Loading() {
  return (
    <Fullscreen alignItems="center" justifyContent="center">
      <Text fontSize={24} color="white">
        Loading font...
      </Text>
    </Fullscreen>
  )
}

export default function App() {
  return (
    <Canvas events={noEvents} style={{ height: '100dvh', touchAction: 'none' }}>
      <PointerEvents />
      <color attach="background" args={['black']} />
      <Suspense fallback={<Loading />}>
        <UI />
      </Suspense>
    </Canvas>
  )
}
