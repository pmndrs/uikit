import { Canvas } from '@react-three/fiber'
import { DefaultProperties, Container, Text, Root, ComponentInternals } from '@react-three/uikit'
import { OrbitControls } from '@react-three/drei'
import { noEvents, PointerEvents } from '@react-three/xr'
import { suspend } from 'suspend-react'
import { useEffect, useMemo, useRef } from 'react'
import { effect, signal } from '@preact/signals-core'
import { Color } from 'three'

const size = 2.4 * 1920
const elements = 60000

export default function App() {
  const getPixel = suspend(loadGetPixel, ['img.png'])
  return (
    <Canvas events={noEvents} style={{ height: '100dvh', touchAction: 'none' }} gl={{ localClippingEnabled: true }}>
      <color attach="background" args={['black']} />
      <PointerEvents />
      <OrbitControls />
      <Root width={size} height={size} positionType="relative">
        <DefaultProperties fontSize={4}>
          <Container positionType="absolute" gap={1} justifyContent="space-between" flexWrap="wrap" inset={0}>
            {new Array(elements).fill(null).map((_, i) => (
              <Pixel key={i} getPixel={getPixel} />
            ))}
          </Container>
        </DefaultProperties>
      </Root>
    </Canvas>
  )
}

type GetPixel = (x: number, y: number) => [number, number, number]

function Pixel({ getPixel }: { getPixel: GetPixel }) {
  const borderWidth = Math.random() * 1
  const color = useMemo(() => signal(new Color('black')), [])
  const ref = useRef<ComponentInternals>(null)
  useEffect(() => {
    const internals = ref.current
    if (internals == null) {
      return
    }
    return effect(() => {
      const center = internals.center.value
      if (center == null) {
        return
      }
      const [r, g, b] = getPixel((680 * (center[0] + size / 2)) / size, 680 * ((-center[1] + size / 2) / size))
      color.value = new Color(r / 255, g / 255, b / 255)
    })
  }, [color, getPixel])
  return (
    <Container
      ref={ref}
      borderRadius={Math.random() * 5}
      backgroundColor={color}
      borderWidth={borderWidth}
      borderColor={Math.random() * 0xffffff}
      transformTranslateZ={Math.random() * 1}
      height={4 + 4 + 2 * borderWidth}
      padding={2}
      hover={{ backgroundColor: 'white', borderColor: 'black' }}
    >
      <Text pointerEvents="none">Hello World</Text>
    </Container>
  )
}

async function loadGetPixel(url: string) {
  return new Promise<GetPixel>((resolve) => {
    const img = new Image()

    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = 680
      canvas.height = 680
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, 680, 680)
      resolve((x, y) => ctx.getImageData(x, y, 1, 1).data as any)
    }
    img.src = url
  })
}
