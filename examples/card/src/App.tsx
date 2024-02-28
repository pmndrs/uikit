import { Environment, OrbitControls } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { EffectComposer, TiltShift2 } from '@react-three/postprocessing'
import { Root, Container, Text, Image, setPreferredColorScheme } from '@react-three/uikit'
import { BellRing, Check, PlusCircle } from '@react-three/uikit-lucide'
import { DefaultColors, colors } from '@/theme.js'
import { Avatar } from '@/avatar.js'
import { Button } from '@/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/card'
import { Switch } from '@/switch'
import { useMemo, useRef } from 'react'
import { signal } from '@preact/signals-core'
import { damp } from 'three/src/math/MathUtils.js'

setPreferredColorScheme('light')

export default function App() {
  return (
    <Canvas
      flat
      camera={{ position: [0, 0, 18], fov: 35 }}
      style={{ height: '100dvh', touchAction: 'none' }}
      gl={{ localClippingEnabled: true }}
    >
      <Root pixelSize={0.01}>
        <DefaultColors>
          <CardPage />
        </DefaultColors>
      </Root>
      <Environment background blur={1} preset="city" />
      <OrbitControls makeDefault />
    </Canvas>
  )
}

const notifications = [
  {
    title: 'Your call has been confirmed.',
    description: '1 hour ago',
  },
  {
    title: 'You have a new message!',
    description: '1 hour ago',
  },
  {
    title: 'Your subscription is expiring soon!',
    description: '2 hours ago',
  },
]

export function CardPage() {
  const openRef = useRef(false)
  const translateY = useMemo(() => signal(-460), [])
  const translateZ = useMemo(() => signal(0), [])
  useFrame((_, delta) => {
    const targetTranslateY = openRef.current ? 0 : -460
    const targetTranslateZ = openRef.current ? 40 : 0
    translateY.value = damp(translateY.value, targetTranslateY, 10, delta)
    translateZ.value = damp(translateZ.value, targetTranslateZ, 10, delta)
  })
  return (
    <Root pixelSize={0.01} sizeX={4.4}>
      <DefaultColors>
        <Container
          onClick={(e) => {
            e.stopPropagation()
            openRef.current = !openRef.current
          }}
          cursor="pointer"
          zIndexOffset={1}
          transformTranslateZ={translateZ}
        >
          <Image borderRadiusTop={20} width="100%" src="https://picsum.photos/600/300" />
          <Container
            backgroundColor={0xffffff}
            dark={{ backgroundColor: 0x0 }}
            flexDirection="row"
            padding={28}
            paddingTop={28 + 4}
            alignItems="center"
            justifyContent="space-between"
            borderRadiusBottom={20}
          >
            <Container gap={8}>
              <Text fontWeight="normal" fontSize={24} lineHeight={1}>
                VanArsdel Marketing
              </Text>
              <Text fontSize={20} fontWeight="medium" letterSpacing={-0.4} color={colors.primary}>
                2 activities for you
              </Text>
            </Container>
            <Container flexDirection="row" gap={-6}>
              <Avatar width={40} src="https://avatar.iran.liara.run/public/boy?username=Scot" />
              <Avatar width={40} src="https://avatar.iran.liara.run/public/boy?username=Theo" />
              <Avatar width={40} src="https://avatar.iran.liara.run/public/boy?username=Paul" />
            </Container>
          </Container>
        </Container>
        <Container transformTranslateY={-40} overflow="hidden">
          <Container
            paddingTop={40}
            transformTranslateY={translateY}
            backgroundColor={colors.secondary}
            borderRadius={20}
          >
            <CardHeader>
              <CardTitle>
                <Text>Notifications</Text>
              </CardTitle>
              <CardDescription>
                <Text>You have 3 unread messages.</Text>
              </CardDescription>
            </CardHeader>
            <CardContent flexDirection="column" gap={16}>
              <Container flexDirection="row" alignItems="center" gap={16} borderRadius={6} border={1} padding={16}>
                <BellRing />
                <Container gap={4}>
                  <Text fontSize={14} lineHeight={1}>
                    Push Notifications
                  </Text>
                  <Text fontSize={14} lineHeight={1.43} color={colors.mutedForeground}>
                    Send notifications to device.
                  </Text>
                </Container>
                <Container flexGrow={1} />
                <Switch />
              </Container>
              <Container>
                {notifications.map((notification, index) => (
                  <Container
                    key={index}
                    marginBottom={index === notifications.length - 1 ? 0 : 16}
                    paddingBottom={index === notifications.length - 1 ? 0 : 16}
                    alignItems="flex-start"
                    flexDirection="row"
                    gap={17}
                  >
                    <Container
                      height={8}
                      width={8}
                      transformTranslateY={4}
                      borderRadius={1000}
                      backgroundColor={colors.primary}
                    />
                    <Container gap={4}>
                      <Text fontSize={14} lineHeight={1}>
                        {notification.title}
                      </Text>
                      <Text fontSize={14} lineHeight={1.43} color={colors.mutedForeground}>
                        {notification.description}
                      </Text>
                    </Container>
                  </Container>
                ))}
              </Container>
            </CardContent>
            <CardFooter>
              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  openRef.current = !openRef.current
                }}
                flexDirection="row"
                width="100%"
              >
                <Check marginRight={8} height={16} width={16} />
                <Text>Mark all as read</Text>
              </Button>
            </CardFooter>
          </Container>
        </Container>
      </DefaultColors>
    </Root>
  )
}
