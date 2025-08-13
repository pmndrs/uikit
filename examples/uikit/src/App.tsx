import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Box, OrbitControls, OrthographicCamera } from '@react-three/drei'
import { signal } from '@preact/signals-core'
import { Text, Fullscreen, VanillaImage, VanillaInput, Video, Image, Portal, Container } from '@react-three/uikit'
import {} from '@react-three/uikit-lucide'
import { Texture } from 'three'
import { noEvents, PointerEvents } from '@react-three/xr'

export default function App() {
  const texture = useMemo(() => signal<Texture | undefined>(undefined), [])
  const [show, setShow] = useState(true)
  const s = useMemo(() => signal(5), [])
  const x = useMemo(() => signal<string | undefined>('red'), [])
  const t = useMemo(() => signal('X X\nX X'), [])
  const ref = useRef<VanillaImage>(null)
  const [input, setInput] = useState<VanillaInput | null>(null)
  const videoRef = useRef<HTMLVideoElement | undefined>(undefined)
  const [videoel, setVideoEl] = useState<HTMLVideoElement | undefined>()

  useEffect(() => {
    const x = input?.element
    if (x == null) {
      return
    }
    const keydown = (e: Event) => {
      if ('key' in e && e.key != 'Enter') {
        return
      }
      x.blur()
    }
    x.addEventListener('keydown', keydown)
    return () => x.removeEventListener('keydown', keydown)
  }, [input])

  useEffect(() => setVideoEl(videoRef.current), [])

  return (
    <>
      {/* @ts-ignore */}
      <video src="./video.mp4" style={{ display: 'none' }} ref={videoRef}></video>
      <Canvas events={noEvents} style={{ height: '100dvh', touchAction: 'none' }}>
        <PointerEvents />
        <OrbitControls />
        <Box />
        <color attach="background" args={['black']} />
        <ambientLight intensity={0.5} />
        <directionalLight intensity={10} position={[5, 1, 10]} />
        <Fullscreen backgroundColor="red" padding={12} gap={12}>
          <Container padding={12} backgroundColor="blue">
            <Text backgroundColor="green">Hello World</Text>
          </Container>

          <Video
            // controls
            onClick={() => {
              videoel?.play()
            }}
            width={300}
            backgroundColor="blue"
            src={videoel}
            // src={'./video.mp4'}
          ></Video>
          <Image src="https://picsum.photos/id/237/200/300" width={100} />
          <Portal borderRadius={30} width="33%">
            <OrthographicCamera
              makeDefault
              position={[0, 0, 100]}
              left={10}
              right={10}
              top={10}
              zoom={100}
              bottom={10}
            />
            <Box rotation-y={Math.PI / 4} args={[2, 2, 2]} />
            <color attach="background" args={['green']} />
          </Portal>
        </Fullscreen>
      </Canvas>
    </>
  )
}

/*
function MeasureText() {
  const measure = useMeasureText()

  useEffect(
    () =>
      void measure({
        fontSize: 100,
        letterSpacing: 0,
        lineHeight: '120%',
        text: 'hello world',
        wordBreak: 'keep-all',
      }).then(console.log),
  )
  return null
}*/

/**
 * text performance tests:
 * <Root width={1920} height={1080} positionType="relative">
          <DefaultProperties fontSize={6}>
            {new Array(100).fill(null).map((_, i) => (
              <Container positionType="absolute" transformTranslateZ={i * 10} gap={1} flexWrap="wrap" inset={0}>
                {new Array(100).fill(null).map((_, i) => (
                  <Text key={i} color="white">
                    Consectetur deserunt ipsum elit id minim do nulla ullamco culpa quis. Fugiat pariatur eiusmod sunt
                    est veniam exercitation adipisicing non minim ut Lorem. Velit consectetur non minim reprehenderit
                    proident aute in ut ipsum incididunt amet. Do ea velit sint cupidatat voluptate non sit incididunt
                    voluptate. Lorem velit aliqua culpa cillum non dolore aliqua nostrud id aliqua consectetur esse
                    fugiat. Culpa excepteur nostrud mollit voluptate aute magna non dolore. Minim aliquip non laborum ut
                    nostrud id esse. Occaecat cillum adipisicing eiusmod laboris adipisicing tempor Lorem anim
                    exercitation sint reprehenderit proident. Amet magna pariatur fugiat fugiat aliquip occaecat do aute
                    pariatur ad nisi laborum eiusmod. Non excepteur laborum anim aute aliqua cillum commodo. Excepteur
                    sunt fugiat aliquip id irure ut. Sunt sunt proident velit minim amet ea sit sint nisi. Irure magna
                    culpa pariatur non adipisicing ad laboris. Laborum id reprehenderit ullamco deserunt incididunt
                    velit esse occaecat magna qui. Incididunt nostrud labore enim elit esse sint est velit magna.
                    Voluptate in ea duis occaecat excepteur ea aliquip voluptate eiusmod ut. Pariatur voluptate nostrud
                    tempor et Lorem do magna incididunt exercitation cupidatat veniam est labore. Deserunt tempor fugiat
                    qui dolore sint sint eiusmod laborum velit magna fugiat culpa consequat. Fugiat esse nisi magna
                    nostrud nostrud aute duis aliquip.
                  </Text>
                ))}
              </Container>
            ))}
          </DefaultProperties>
        </Root>
 */
