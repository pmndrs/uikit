import { StrictMode, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { Box, OrbitControls, OrthographicCamera, RenderTexture } from '@react-three/drei'
import { signal } from '@preact/signals-core'
import {
  DefaultProperties,
  Container,
  Content,
  Svg,
  Text,
  Image,
  Fullscreen,
  Portal,
  SuspendingImage,
  Input,
  FontFamilyProvider,
  Video,
  useMeasureText,
  InputInternals,
  ImageRef,
} from '@react-three/uikit'
import { Texture } from 'three'
import { Skeleton } from '../../../packages/kits/default/src/skeleton.js'
import { noEvents, PointerEvents } from '@react-three/xr'

export default function App() {
  const texture = useMemo(() => signal<Texture | undefined>(undefined), [])
  const [show, setShow] = useState(true)
  const s = useMemo(() => signal(5), [])
  const x = useMemo(() => signal<string | undefined>('red'), [])
  const t = useMemo(() => signal('X X\nX X'), [])
  const ref = useRef<ImageRef>(null)
  const [input, setInput] = useState<InputInternals | null>(null)
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
      <video style={{ display: 'none' }} ref={videoRef}>
        <source src="./video.mp4" />
      </video>
      <Canvas events={noEvents} style={{ height: '100dvh', touchAction: 'none' }} gl={{ localClippingEnabled: true }}>
        <PointerEvents />
        <MeasureText />
        <OrbitControls />
        <Box />
        <StrictMode>
          <FontFamilyProvider inter={{ normal: 'inter-normal.json' }}>
            <color attach="background" args={['black']} />
            <ambientLight intensity={0.5} />
            <directionalLight intensity={10} position={[5, 1, 10]} />
            <RenderTexture ref={(t) => void (texture.value = t ?? undefined)}>
              <Box />
            </RenderTexture>
            {show && (
              <Fullscreen
                renderOrder={10}
                distanceToCamera={1}
                gap={10}
                overflow="scroll"
                padding={10}
                alignItems="center"
                flexDirection="column"
                borderWidth={10}
                borderRightWidth={0}
                borderColor="red"
              >
                {/* Tests for the Portal component.*/}
                <Container flexShrink={0} flexDirection="row" height={500}>
                  <Video
                    // controls
                    onClick={() => {
                      videoel?.play()
                    }}
                    height={300}
                    src={videoel}
                    // src={'./video.mp4'}
                  ></Video>

                  {/* By default, the Portal should create it's own camera and thus
                not be affected by the scene camera and orbit controls..*/}
                  {/* <Portal dpr={0.5} borderRadius={30} width="33%">
                <Box rotation-y={Math.PI / 4} args={[2, 2, 2]} />
                <color attach="background" args={['red']} />
              </Portal> */}
                  {/* However, we can provide a camera with custom properties, like
                a different position or field of view. Note that the aspect
                ratio will be overriden to match with the screens aspect ratio,
                s.t. resizing the screen would not distort the portal view.*/}
                  {/* <Portal borderRadius={30} width="33%">
                <PerspectiveCamera makeDefault position={[0, -1, 4]} fov={500} aspect={100} />
                <Box rotation-y={Math.PI / 4} args={[2, 2, 2]} />
                <color attach="background" args={['blue']} />
              </Portal> */}
                  {/* The resizing should work for the orthographic camera as well.*/}
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
                </Container>
                <Container
                  flexShrink={0}
                  flexDirection="column"
                  backgroundColor="blue"
                  width={100}
                  positionType="relative"
                >
                  <Container flexDirection="column">
                    <Text wordBreak="break-all" height={100}>
                      Escribe algo...
                    </Text>
                  </Container>
                  <Container
                    flexDirection="column"
                    backgroundColor="red"
                    positionType="absolute"
                    positionTop="100%"
                    positionRight="100%"
                  >
                    <Text>Escribe algo...</Text>
                  </Container>
                </Container>
                <DefaultProperties opacity={0.5} borderWidth={s}>
                  <Image flexShrink={0} width={300} height={300} src={texture ?? undefined} />
                  <Text
                    onClick={() => {
                      t.value += 'X'
                      setShow((s) => !s)
                    }}
                    flexShrink={0}
                    width="100%"
                    backgroundOpacity={0.5}
                    backgroundColor="black"
                    fontSize={30}
                    verticalAlign="bottom"
                    textAlign="block"
                    cursor="pointer"
                    color="white"
                  >
                    {t}
                    more
                  </Text>
                  <Container
                    flexShrink={0}
                    onHoverChange={(hover) => (x.value = hover ? 'yellow' : undefined)}
                    backgroundColor={x}
                    borderColor="white"
                    flexDirection="column"
                    borderBend={1}
                    borderWidth={20}
                    borderRadius={30}
                    width={300}
                    height={100}
                  />
                  <Content
                    flexShrink={0}
                    height={200}
                    width={200}
                    hover={{ height: 300 }}
                    transformScaleZ={0.05}
                    depthAlign="back"
                    onSizeChange={(w, h) => console.log(w, h)}
                    keepAspectRatio={false}
                    borderRightWidth={100}
                  >
                    <mesh>
                      <planeGeometry />
                      <meshPhongMaterial depthWrite={false} transparent />
                    </mesh>
                  </Content>
                  <Content flexShrink={0} width={100}>
                    <Box>
                      <meshBasicMaterial transparent color="black" />
                    </Box>
                  </Content>
                  <Svg flexShrink={0} marginLeft={-100} color={x} backgroundColor="red" src="example.svg" width={200} />
                  <Suspense fallback={<Skeleton width={300} aspectRatio={2 / 3} />}>
                    <SuspendingImage
                      flexShrink={0}
                      hover={{ padding: 30, marginLeft: -30, opacity: 1 }}
                      objectFit="cover"
                      borderWidth={20}
                      ref={ref}
                      onHoverChange={(hovered) => ref.current?.setStyle({ borderOpacity: hovered ? 1 : 0.5 })}
                      borderOpacity={0.5}
                      borderRadius={10}
                      flexDirection="column"
                      src="https://picsum.photos/2000/3000"
                      width={300}
                      overflow="scroll"
                    >
                      <Text
                        flexShrink={0}
                        minHeight={100}
                        backgroundColor="black"
                        verticalAlign="center"
                        textAlign="center"
                        padding={10}
                        color="white"
                      >
                        Hello World!
                      </Text>
                      <Text color="white" flexShrink={0} backgroundColor="black" padding={10}>
                        Lorem voluptate aliqua est veniam pariatur enim reprehenderit nisi laboris. Tempor sit magna ea
                        occaecat velit veniam ipsum do deserunt adipisicing labore. Voluptate consectetur Lorem
                        exercitation laborum do nulla velit sit. Aliqua sit cupidatat excepteur fugiat. Labore proident
                        ea in in ex ad aute adipisicing ad in occaecat ullamco tempor pariatur. Excepteur consequat
                        ullamco id est duis elit. Est duis mollit adipisicing labore fugiat duis elit magna. Deserunt
                        nulla dolore deserunt id sint fugiat cillum cupidatat nulla dolore veniam anim nulla sunt.
                        Excepteur excepteur nisi officia eiusmod incididunt do. Id reprehenderit aute nulla dolor ut ex
                        veniam aliqua laboris nisi. Aliqua aute nulla fugiat dolor voluptate quis. Velit sit aliqua
                        eiusmod irure.
                      </Text>
                    </SuspendingImage>
                  </Suspense>
                </DefaultProperties>

                <Container
                  flexShrink={0}
                  flexDirection="column"
                  positionType="relative"
                  width="60%"
                  alignItems="center"
                  justifyContent="center"
                  zIndexOffset={1}
                >
                  <Container
                    width={100}
                    height={100}
                    onClick={() => input?.focus()}
                    positionType="absolute"
                    positionBottom="100%"
                    positionRight="100%"
                    marginRight={10}
                    flexDirection="column"
                    backgroundColor="red"
                  ></Container>
                  <Input
                    ref={setInput}
                    onFocusChange={(focus) => console.log('focus change', focus)}
                    backgroundColor="white"
                    width="100%"
                    height="100%"
                    fontSize={100}
                    color="red"
                    wordBreak="keep-all"
                    caretWidth={10}
                    caretBorderRadius={5}
                    caretBorderWidth={3}
                    caretOpacity={0}
                    caretBorderColor="orange"
                    selectionOpacity={0}
                    selectionBorderRadius={5}
                    selectionBorderWidth={3}
                    selectionBorderColor="orange"
                    focus={{ borderRadius: 20 }}
                    verticalAlign="center"
                    textAlign="center"
                    multiline
                    defaultValue="Hello world"
                  />
                </Container>

                {show ? (
                  <Container
                    flexShrink={0}
                    flexDirection="column"
                    overflow="scroll"
                    maxHeight={500}
                    height={500}
                    paddingRight={10}
                  >
                    <Container
                      onClick={() => (s.value += 10)}
                      backgroundColor="yellow"
                      width={300}
                      minHeight={300}
                      height={300}
                      flexDirection="column"
                    />
                    <Container
                      flexDirection="column"
                      backgroundColor="black"
                      width={300}
                      minHeight={300}
                      height={300}
                    />
                  </Container>
                ) : undefined}
              </Fullscreen>
            )}
          </FontFamilyProvider>
        </StrictMode>
      </Canvas>
    </>
  )
}

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
}

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
