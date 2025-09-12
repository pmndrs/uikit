import { Canvas, useFrame } from '@react-three/fiber'
import { Container, Fullscreen, Text, setPreferredColorScheme, canvasInputProps, Svg } from '@react-three/uikit'
import { colors, Button, defaultProperties } from '@react-three/uikit-default'
import { UserAuthForm } from './components/user-auth-form.js'
import { noEvents, PointerEvents } from '@react-three/xr'
import { create } from 'zustand'

setPreferredColorScheme('light')

export default function App() {
  return (
    <>
      <FrameCounter />
      <Canvas
        flat
        frameloop="demand"
        camera={{ position: [0, 0, 18], fov: 35 }}
        style={{ height: '100dvh', touchAction: 'none' }}
        gl={{ localClippingEnabled: true }}
        events={noEvents}
        {...canvasInputProps}
      >
        <CountFrames />
        <PointerEvents />
        <Fullscreen backgroundColor={colors.background} {...defaultProperties}>
          <AuthenticationPage />
        </Fullscreen>
      </Canvas>
    </>
  )
}

const useFrameCounter = create(() => 0)

function CountFrames() {
  useFrame(() => useFrameCounter.setState(useFrameCounter.getState() + 1))
  return null
}

function FrameCounter() {
  const counter = useFrameCounter()
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: 'black',
        fontSize: '2rem',
        padding: '0.5rem 1rem',
        color: 'white',
        fontFamily: 'sans-serif',
        zIndex: 100,
      }}
    >
      {counter}
    </div>
  )
}

function AuthenticationPage() {
  return (
    <Container width="100%" height="100%" positionType="relative" flexDirection="row" alignItems="center">
      <Button
        variant="ghost"
        positionType="absolute"
        positionRight={16}
        positionTop={16}
        md={{ positionRight: 32, positionTop: 32 }}
      >
        <Text>Login</Text>
      </Button>
      <Container
        positionType="relative"
        flexGrow={1}
        flexBasis={0}
        maxWidth={0}
        overflow="hidden"
        height="100%"
        flexDirection="column"
        dark={{ borderRightWidth: 1 }}
        padding={0}
        lg={{ padding: 40, maxWidth: 10000 }}
        backgroundColor={0x18181b}
        {...{ '*': { color: 'white' } }}
      >
        <Container flexDirection="row" alignItems="center">
          <Svg
            content={`<svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2 h-6 w-6"
            >
              <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
            </svg>`}
            width={24}
            height={24}
            marginRight={8}
          />

          <Text fontSize={18} lineHeight="28px" fontWeight="medium">
            Acme Inc
          </Text>
        </Container>
        <Container flexDirection="column" marginTop="auto">
          <Container flexDirection="column" gap={8}>
            <Text fontSize={18} lineHeight="28px">
              "Culpa eiusmod ut ipsum sunt velit labore minim eu. Occaecat magna mollit aliqua cupidatat."
            </Text>
            <Text fontSize={14} lineHeight="20px">
              Max Mustermann
            </Text>
          </Container>
        </Container>
      </Container>
      <Container flexDirection="column" flexBasis={0} flexGrow={1} padding={16} lg={{ padding: 32 }}>
        <Container
          flexDirection="column"
          marginX="auto"
          width="100%"
          justifyContent="center"
          gap={24}
          sm={{ width: 350 }}
        >
          <Container alignItems="center" flexDirection="column" gap={8} {...{ '*': { textAlign: 'center' } }}>
            <Text fontSize={24} lineHeight="32px" fontWeight="semi-bold" letterSpacing={-0.4}>
              Create an account
            </Text>
            <Text fontSize={14} lineHeight="20px" color={colors.mutedForeground}>
              Enter your email below to create your account
            </Text>
          </Container>
          <UserAuthForm />
          <Text paddingX={32} textAlign="center" fontSize={14} lineHeight="20px" color={colors.mutedForeground}>
            By clicking continue, you agree to our Terms of Service and Privacy Policy.
          </Text>
        </Container>
      </Container>
    </Container>
  )
}
